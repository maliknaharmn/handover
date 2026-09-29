import Link from "next/link";
import { requireHandover, getMetrics } from "@/lib/handover/data";
import { localDate } from "@/lib/handover/types";
import { MetricsView } from "@/components/handover/progress";
import { Field, Feedback, Panel, Empty, SelectField, Status } from "@/components/handover/ui";
import { SubmitButton } from "@/components/handover/submit-button";
import { applyTemplate, changeHandoverAction, createCategory, createHandoverAssignment, createItem, reassignHandoverPosition, updateCategory, updateHandover } from "../../admin-actions";

export default async function HandoverDetail({ params, searchParams }: {
  params: Promise<{ slug: string; id: string }>; searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { slug, id } = await params;
  const { supabase, org, handover, isAdmin } = await requireHandover(slug, id);
  const [feedback, periods, positions, assignments, categories, items, members, templates, metrics] = await Promise.all([
    searchParams,
    supabase.from("periods").select("id,label").eq("organization_id", org.id),
    supabase.from("positions").select("id,name").eq("organization_id", org.id).eq("is_active", true),
    supabase.from("handover_assignments").select("id,position_id,outgoing_user_id,incoming_user_id").eq("handover_id", id),
    supabase.from("handover_categories").select("id,name,sort_order").eq("handover_id", id).order("sort_order"),
    supabase.from("handover_items").select("id,title,status,is_required,is_active,assignment_id,category_id").eq("handover_id", id).order("updated_at", { ascending: false }).limit(10),
    supabase.from("organization_members").select("user_id,roles").eq("organization_id", org.id).eq("is_active", true),
    supabase.from("checklist_templates").select("id,name").eq("organization_id", org.id).eq("is_active", true),
    getMetrics(slug, id),
  ]);
  const names = new Map((periods.data ?? []).map((p) => [p.id, p.label]));
  const positionNames = new Map((positions.data ?? []).map((p) => [p.id, p.name]));
  const memberIds = members.data?.map((m) => m.user_id) ?? [];
  const { data: profiles } = memberIds.length ? await supabase.from("profiles").select("id,display_name").in("id", memberIds) : { data: [] };
  const people = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));
  const base = `/org/${slug}/handovers/${id}`;
  return <div className="space-y-6">
    <Link href={`/org/${slug}/handovers`} className="text-sm text-primary">← Semua handover</Link>
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-semibold tracking-tight">
      {names.get(handover.from_period_id)} → {names.get(handover.to_period_id)}</h1><p className="mt-2 text-sm text-muted-foreground">Target selesai: {localDate(handover.due_on)}</p></div><Status value={handover.status} /></div>
    <Feedback {...feedback} />
    <div className="flex flex-wrap gap-3 text-sm"><Link className="text-primary underline" href={`${base}/items`}>Semua item</Link>
      <Link className="text-primary underline" href={`${base}/activity`}>Aktivitas</Link></div>
    <Panel title="Progres item wajib"><MetricsView metrics={metrics} /></Panel>
    {isAdmin ? <>
      {handover.status === "draft" ? <Panel title="Rencana transisi"><form action={updateHandover.bind(null,slug,id)} className="grid max-w-xl gap-4 sm:grid-cols-2">
        <SelectField label="Periode asal" name="from_period_id" defaultValue={handover.from_period_id} options={(periods.data ?? []).map((p) => ({ value: p.id, label: p.label }))} />
        <SelectField label="Periode tujuan" name="to_period_id" defaultValue={handover.to_period_id} options={(periods.data ?? []).map((p) => ({ value: p.id, label: p.label }))} />
        <Field label="Target selesai" name="due_on" type="date" defaultValue={handover.due_on ?? ""} />
        <button className="min-h-10 self-end rounded-full border border-primary px-4 text-sm text-primary">Simpan rencana</button>
      </form></Panel> : null}
      <Panel title="Status handover"><form action={changeHandoverAction.bind(null, slug, id)} className="flex flex-wrap items-end gap-3">
        {handover.status === "draft" ? <button name="action" value="activate" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white">Aktifkan handover</button> : null}
        {handover.status === "active" ? <button name="action" value="complete" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white">Tutup handover</button> : null}
        {handover.status === "completed" ? <><Field label="Alasan buka kembali" name="reason" required minLength={5} />
          <button name="action" value="reopen" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white">Buka kembali</button></> : null}
      </form></Panel>
      {handover.status !== "completed" ? <>
        <Panel title="Pasangan penyerah dan penerima"><form action={createHandoverAssignment.bind(null, slug, id)} className="grid max-w-xl gap-4 sm:grid-cols-2">
          <SelectField label="Posisi" name="position_id" options={(positions.data ?? []).map((p) => ({ value: p.id, label: p.name }))} />
          <SelectField label="Penyerah" name="outgoing_user_id" options={(members.data ?? []).filter((m) => m.roles.includes("outgoing")).map((m) => ({ value: m.user_id, label: people.get(m.user_id) || m.user_id }))} />
          <SelectField label="Penerima" name="incoming_user_id" options={(members.data ?? []).filter((m) => m.roles.includes("incoming")).map((m) => ({ value: m.user_id, label: people.get(m.user_id) || m.user_id }))} />
          <div className="self-end"><SubmitButton>Tambah pasangan</SubmitButton></div>
        </form><ul className="mt-5 space-y-2 text-sm">{(assignments.data ?? []).map((a) => <li key={a.id} className="border-t pt-2">
          {positionNames.get(a.position_id)} · {people.get(a.outgoing_user_id) || a.outgoing_user_id} → {people.get(a.incoming_user_id) || a.incoming_user_id}</li>)}</ul></Panel>
        {assignments.data?.length ? <Panel title="Ganti pasangan pada posisi"><form action={reassignHandoverPosition.bind(null,slug,id)} className="grid max-w-xl gap-4 sm:grid-cols-2">
          <SelectField label="Posisi" name="assignment_id" options={assignments.data.map((a) => ({ value: a.id, label: positionNames.get(a.position_id) || a.id }))} />
          <SelectField label="Penyerah baru" name="outgoing_user_id" options={(members.data ?? []).filter((m) => m.roles.includes("outgoing")).map((m) => ({ value: m.user_id, label: people.get(m.user_id) || m.user_id }))} />
          <SelectField label="Penerima baru" name="incoming_user_id" options={(members.data ?? []).filter((m) => m.roles.includes("incoming")).map((m) => ({ value: m.user_id, label: people.get(m.user_id) || m.user_id }))} />
          <Field label="Alasan perubahan" name="reason" required minLength={5} />
          <SubmitButton>Simpan pasangan baru</SubmitButton>
        </form></Panel> : null}
        <Panel title="Tambah kategori"><form action={createCategory.bind(null, slug, id)} className="flex max-w-xl flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1"><Field label="Nama kategori" name="name" required /></div><SubmitButton>Tambah</SubmitButton>
        </form><ul className="mt-4 divide-y text-sm">{(categories.data ?? []).map((c) => <li key={c.id} className="py-2"><details>
          <summary className="cursor-pointer">{c.name} · ubah label</summary>
          <form action={updateCategory.bind(null,slug,id)} className="mt-2 flex max-w-xl flex-wrap items-end gap-2"><input type="hidden" name="id" value={c.id} />
            <div className="min-w-48 flex-1"><Field label="Nama kategori" name="name" required defaultValue={c.name} /></div>
            <button className="min-h-10 rounded-full border border-primary px-4 text-primary">Simpan</button></form>
        </details></li>)}</ul></Panel>
        <Panel title="Tambah item"><form action={createItem.bind(null, slug, id)} className="grid max-w-xl gap-4">
          <Field label="Judul checklist" name="title" required minLength={2} />
          <SelectField label="Posisi dan pasangan" name="assignment_id" options={(assignments.data ?? []).map((a) => ({ value: a.id, label: positionNames.get(a.position_id) || a.id }))} />
          <SelectField label="Kategori" name="category_id" options={(categories.data ?? []).map((c) => ({ value: c.id, label: c.name }))} />
          <Field label="Tenggat (opsional)" name="due_on" type="date" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_required" defaultChecked />Item wajib</label>
          <SubmitButton>Tambah item</SubmitButton>
        </form></Panel>
        {handover.status === "draft" ? <Panel title="Gunakan template"><form action={applyTemplate.bind(null, slug, id)} className="grid max-w-xl gap-4">
          <SelectField label="Template" name="template_id" options={(templates.data ?? []).map((t) => ({ value: t.id, label: t.name }))} />
          <SelectField label="Salin ke posisi" name="assignment_id" options={(assignments.data ?? []).map((a) => ({ value: a.id, label: positionNames.get(a.position_id) || a.id }))} />
          <SubmitButton>Salin item template</SubmitButton></form></Panel> : null}
      </> : null}
    </> : null}
    <Panel title="Item terbaru" action={<Link href={`${base}/items`} className="text-sm text-primary underline">Lihat semua</Link>}>
      {items.data?.length ? <ul className="divide-y">{items.data.map((item) => <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
        <Link href={`${base}/items/${item.id}`} className="font-medium text-primary underline underline-offset-4">{item.title}</Link><Status value={item.status} />
      </li>)}</ul> : <Empty text="Belum ada item checklist." />}
    </Panel>
  </div>;
}
