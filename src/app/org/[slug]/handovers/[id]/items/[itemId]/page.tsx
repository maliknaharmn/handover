import Link from "next/link";
import { requireItem } from "@/lib/handover/data";
import { localDate } from "@/lib/handover/types";
import { Field, Feedback, Panel, SelectField, Status, TextArea } from "@/components/handover/ui";
import { SubmitButton } from "@/components/handover/submit-button";
import { ItemEditForm } from "@/components/handover/item-edit-form";
import { configureItem, transitionItem } from "../item-actions";

const detailFields: Record<string, [string,string][]> = {
  Accounts: [["asset_type","Jenis aset"],["current_owner","Owner saat ini"],["transfer_status","Status transfer"],["secure_channel","Kanal aman untuk transfer"]],
  Documents: [["document_name","Nama dokumen"],["version_label","Versi/tahun"],["owner","Owner"],["transfer_status","Status transfer"]],
  Programs: [["goal","Tujuan program"],["schedule","Jadwal"],["evaluation","Hasil dan evaluasi"],["recommendation","Rekomendasi"]],
  Stakeholders: [["name","Nama stakeholder"],["affiliation","Afiliasi"],["role","Peran"],["contact","Kontak yang boleh dibagikan"],["context","Konteks hubungan"],["communication_notes","Catatan komunikasi"]],
  Tasks: [["task_description","Deskripsi tugas"],["owner","Owner tugas"],["task_due_on","Tenggat tugas"],["priority","Prioritas"],["work_status","Status pekerjaan"]],
};

export default async function ItemDetail({ params, searchParams }: {
  params: Promise<{ slug: string; id: string; itemId: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { slug, id, itemId } = await params;
  const { supabase, org, handover, item, userId, isAdmin } = await requireItem(slug,id,itemId);
  const [feedback, assignment, category, comments, categories, assignments] = await Promise.all([
    searchParams,
    supabase.from("handover_assignments").select("id,position_id,outgoing_user_id,incoming_user_id").eq("id",item.assignment_id).single(),
    supabase.from("handover_categories").select("id,name").eq("id",item.category_id).single(),
    supabase.from("handover_item_comments").select("id,author_id,author_label,body,is_revision_reason,created_at").eq("item_id",item.id).order("created_at"),
    supabase.from("handover_categories").select("id,name").eq("handover_id",id),
    supabase.from("handover_assignments").select("id,position_id,outgoing_user_id,incoming_user_id").eq("handover_id",id),
  ]);
  const a = assignment.data;
  const authorIds = [...new Set([a?.outgoing_user_id,a?.incoming_user_id,...(comments.data ?? []).map((c) => c.author_id)].filter((value): value is string => !!value))];
  const [profiles, position, allPositions] = await Promise.all([
    authorIds.length ? supabase.from("profiles").select("id,display_name").in("id",authorIds) : Promise.resolve({ data: [] }),
    a ? supabase.from("positions").select("id,name").eq("id",a.position_id).single() : Promise.resolve({ data: null }),
    supabase.from("positions").select("id,name").eq("organization_id",org.id),
  ]);
  const names = new Map((profiles.data ?? []).map((p) => [p.id,p.display_name]));
  const positions = new Map((allPositions.data ?? []).map((p) => [p.id,p.name]));
  const canEdit = handover.status === "active" && item.is_active && a?.outgoing_user_id === userId && ["not_started","in_progress","revision_required"].includes(item.status);
  const canAdminCorrect = handover.status === "active" && item.is_active && isAdmin && !canEdit && ["not_started","in_progress","revision_required"].includes(item.status);
  const canReview = handover.status === "active" && item.is_active && item.status === "ready_for_review" && a?.outgoing_user_id !== userId && (a?.incoming_user_id === userId || isAdmin);
  const canComment = handover.status === "active" && item.is_active && (isAdmin || a?.outgoing_user_id === userId || a?.incoming_user_id === userId);
  const base = `/org/${slug}/handovers/${id}`;
  return <div className="space-y-6">
    <Link href={`${base}/items`} className="text-sm text-primary">← Semua item</Link>
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm text-muted-foreground">{category.data?.name} · {position.data?.name}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{item.title || "Item tanpa judul"}</h1></div><Status value={item.status} /></div>
    <Feedback {...feedback} />
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
      <div className="space-y-6">
        <Panel title="Informasi yang diserahkan">
          <p className="whitespace-pre-wrap text-sm leading-6">{item.description || "Belum ada deskripsi."}</p>
          {Object.entries(item.details ?? {}).length ? <dl className="mt-5 grid gap-3 border-t pt-4 text-sm sm:grid-cols-2">
            {Object.entries(item.details).map(([key,value]) => <div key={key}><dt className="text-xs text-muted-foreground">{detailFields[category.data?.name ?? ""]?.find(([field]) => field === key)?.[1] ?? key}</dt><dd className="mt-1 whitespace-pre-wrap">{value}</dd></div>)}
          </dl> : null}
        </Panel>
        <Panel title="Referensi dan catatan">
          {item.reference_url ? <a className="font-medium text-primary underline underline-offset-4" href={item.reference_url} target="_blank" rel="noopener noreferrer">{item.reference_label || "Buka referensi eksternal"} ↗</a>
            : <p className="text-sm text-muted-foreground">Belum ada tautan referensi.</p>}
          <p className="mt-4 whitespace-pre-wrap text-sm leading-6">{item.notes || "Belum ada catatan tambahan."}</p>
          <p className="mt-4 text-xs text-muted-foreground">Akses ke dokumen atau akun eksternal harus diperiksa manual oleh penerima. Jangan tulis password, token, atau recovery code di sini.</p>
        </Panel>
        {canEdit || canAdminCorrect ? <Panel title={canAdminCorrect ? "Koreksi administratif" : "Lengkapi penyerahan"}>
          <ItemEditForm slug={slug} handoverId={id} itemId={itemId} version={item.version}
            initialValues={{ title: item.title, description: item.description, notes: item.notes,
              reference_label: item.reference_label ?? "", reference_url: item.reference_url ?? "", ...item.details }}
            fields={detailFields[category.data?.name ?? ""] ?? []} adminCorrection={canAdminCorrect} />
        {canEdit && item.status === "in_progress" ? <form action={transitionItem.bind(null,slug,id,itemId)} className="mt-4 border-t pt-4">
          <input type="hidden" name="version" value={item.version} /><button name="action" value="submit" className="min-h-11 rounded-full bg-primary px-5 text-sm font-semibold text-white">Kirim untuk review</button>
        </form> : null}</Panel> : null}
        {canReview ? <Panel title="Keputusan review"><p className="mb-4 text-sm text-muted-foreground">Periksa isi dan akses referensi sebelum mengambil keputusan. Penyerah tidak boleh memverifikasi item sendiri.</p>
          <form action={transitionItem.bind(null,slug,id,itemId)} className="mb-5"><input type="hidden" name="version" value={item.version} />
            <button name="action" value="verify" className="min-h-11 rounded-full bg-primary px-5 text-sm font-semibold text-white">Verifikasi item</button></form>
          <form action={transitionItem.bind(null,slug,id,itemId)} className="space-y-3 border-t pt-5"><input type="hidden" name="version" value={item.version} />
            <TextArea label="Alasan revisi" name="reason" required rows={3} maxLength={4000} hint="Jelaskan hal yang perlu diperbaiki (minimal 5 karakter)." />
            <button name="action" value="revise" className="min-h-11 rounded-full border border-amber-600 px-5 text-sm font-semibold text-amber-900">Minta revisi</button>
          </form></Panel> : null}
        <section aria-labelledby="comments-title" className="border-t pt-5"><h2 id="comments-title" className="text-lg font-semibold">Komentar</h2>
          {comments.data?.length ? <ol className="mt-3 divide-y">{comments.data.map((comment) => <li key={comment.id} className="py-4 text-sm">
            <div className="flex flex-wrap justify-between gap-2"><strong>{names.get(comment.author_id) || comment.author_label}{comment.is_revision_reason ? " · Alasan revisi" : ""}</strong>
              <time className="text-muted-foreground">{localDate(comment.created_at,org.timezone)}</time></div><p className="mt-2 whitespace-pre-wrap">{comment.body}</p>
          </li>)}</ol> : <p className="mt-2 text-sm text-muted-foreground">Belum ada komentar.</p>}
          {canComment ? <form action={transitionItem.bind(null,slug,id,itemId)} className="mt-5 grid max-w-xl gap-3">
            <input type="hidden" name="version" value={item.version} /><TextArea label="Tambah komentar" name="body" rows={3} required maxLength={4000} />
            <div><button name="action" value="comment" className="min-h-11 rounded-full border border-primary px-5 text-sm font-semibold text-primary">Kirim komentar</button></div>
          </form> : null}</section>
      </div>
      <aside className="space-y-6">
        <Panel title="Kepemilikan"><dl className="space-y-3 text-sm">
          <div><dt className="text-muted-foreground">Penyerah</dt><dd>{a ? names.get(a.outgoing_user_id) || a.outgoing_user_id : "—"}</dd></div>
          <div><dt className="text-muted-foreground">Penerima</dt><dd>{a ? names.get(a.incoming_user_id) || a.incoming_user_id : "—"}</dd></div>
          <div><dt className="text-muted-foreground">Kewajiban</dt><dd>{item.is_required ? "Wajib" : "Opsional"}</dd></div>
          <div><dt className="text-muted-foreground">Tenggat</dt><dd>{localDate(item.due_on,org.timezone)}</dd></div>
          <div><dt className="text-muted-foreground">Diperbarui</dt><dd>{localDate(item.updated_at,org.timezone)}</dd></div>
          {item.verified_by ? <div><dt className="text-muted-foreground">Diverifikasi oleh</dt><dd>{names.get(item.verified_by) || item.verified_by} · {localDate(item.verified_at,org.timezone)}</dd></div> : null}
        </dl></Panel>
        {isAdmin && handover.status === "active" && item.status === "verified" ? <Panel title="Buka ulang item">
          <form action={transitionItem.bind(null,slug,id,itemId)} className="space-y-3"><input type="hidden" name="version" value={item.version} />
            <TextArea label="Alasan koreksi" name="reason" required rows={3} /><button name="action" value="reopen" className="min-h-11 rounded-full border border-primary px-5 text-sm font-semibold text-primary">Buka kembali</button>
          </form></Panel> : null}
        {isAdmin && handover.status !== "completed" ? <Panel title="Atur item"><form action={configureItem.bind(null,slug,id,itemId)} className="grid gap-4">
          <input type="hidden" name="version" value={item.version} />
          <SelectField label="Posisi dan pasangan" name="assignment_id" defaultValue={item.assignment_id} options={(assignments.data ?? []).map((assignment) =>
            ({ value: assignment.id, label: positions.get(assignment.position_id) || assignment.id }))} />
          <SelectField label="Kategori" name="category_id" defaultValue={item.category_id} options={(categories.data ?? []).map((c) => ({ value: c.id, label: c.name }))} />
          <Field label="Tenggat" name="due_on" type="date" defaultValue={item.due_on ?? ""} />
          <label className="flex gap-2 text-sm"><input type="checkbox" name="is_required" defaultChecked={item.is_required} />Item wajib</label>
          <label className="flex gap-2 text-sm"><input type="checkbox" name="is_active" defaultChecked={item.is_active} />Item aktif</label>
          <TextArea label="Alasan perubahan" name="reason" rows={2} required={handover.status === "active"} />
          <div><SubmitButton>Simpan pengaturan</SubmitButton></div>
        </form></Panel> : null}
      </aside>
    </div>
  </div>;
}
