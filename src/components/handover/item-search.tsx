import Link from "next/link";
import { requireOrg } from "@/lib/handover/context";
import { safeUuid } from "@/lib/handover/navigation";
import { localDate, type Item } from "@/lib/handover/types";
import { Empty, Panel, Status } from "./ui";

type Search = { q?: string; status?: string | string[]; category?: string; position?: string; owner?: string; page?: string };
const statusOptions = [
  ["not_started","Belum dimulai"], ["in_progress","Dikerjakan"], ["ready_for_review","Menunggu review"],
  ["revision_required","Perlu revisi"], ["verified","Terverifikasi"],
];

export async function ItemSearch({ slug, handoverId, search }: { slug: string; handoverId?: string; search: Search }) {
  const { supabase, org } = await requireOrg(slug);
  const page = Math.max(1, Math.min(200, Number(search.page) || 1));
  const statuses = Array.isArray(search.status) ? search.status : search.status ? [search.status] : [];
  const allowed = statuses.filter((status) => statusOptions.some(([value]) => value === status));
  const [result, categories, assignments, positions, handovers, periods, members] = await Promise.all([
    supabase.rpc("search_items", { p_organization_id: org.id, p_handover_id: handoverId ?? null,
      p_query: (search.q ?? "").slice(0, 120), p_status: allowed.length ? allowed.join(",") : null,
      p_category_id: safeUuid(search.category), p_position_id: safeUuid(search.position),
      p_owner_id: safeUuid(search.owner), p_limit: 50, p_offset: (page - 1) * 50 }),
    supabase.from("handover_categories").select("id,handover_id,name").eq("organization_id", org.id),
    supabase.from("handover_assignments").select("id,position_id,outgoing_user_id,incoming_user_id").eq("organization_id", org.id),
    supabase.from("positions").select("id,name").eq("organization_id", org.id),
    supabase.from("handovers").select("id,from_period_id,to_period_id").eq("organization_id", org.id),
    supabase.from("periods").select("id,label").eq("organization_id", org.id),
    supabase.from("organization_members").select("user_id").eq("organization_id", org.id).eq("is_active", true),
  ]);
  const items = (result.data ?? []) as Item[];
  const categoryNames = new Map((categories.data ?? []).map((c) => [c.id,c.name]));
  const assignmentById = new Map((assignments.data ?? []).map((a) => [a.id,a]));
  const positionNames = new Map((positions.data ?? []).map((p) => [p.id,p.name]));
  const handoverById = new Map((handovers.data ?? []).map((h) => [h.id,h]));
  const periodNames = new Map((periods.data ?? []).map((p) => [p.id,p.label]));
  const memberIds = members.data?.map((m) => m.user_id) ?? [];
  const { data: profiles } = memberIds.length ? await supabase.from("profiles").select("id,display_name").in("id",memberIds) : { data: [] };
  const people = new Map((profiles ?? []).map((p) => [p.id,p.display_name]));
  const query = new URLSearchParams();
  if (search.q) query.set("q", search.q);
  allowed.forEach((status) => query.append("status",status));
  for (const key of ["category","position","owner"] as const) if (search[key]) query.set(key,search[key]);
  const base = handoverId ? `/org/${slug}/handovers/${handoverId}/items` : `/org/${slug}/search`;
  return <div className="space-y-5">
    <Panel title="Cari dan saring"><form action={base} method="get" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="flex flex-col gap-1 text-sm font-medium sm:col-span-2">Cari informasi
        <input name="q" type="search" maxLength={120} defaultValue={search.q ?? ""} placeholder="Judul, posisi, stakeholder…"
          className="min-h-11 rounded-xl border border-input bg-white px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring" /></label>
      <label className="flex flex-col gap-1 text-sm font-medium">Kategori<select name="category" defaultValue={search.category ?? ""} className="min-h-11 rounded-xl border bg-white px-3">
        <option value="">Semua</option>{(categories.data ?? []).filter((c) => !handoverId || c.handover_id === handoverId).map((c) =>
          <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label className="flex flex-col gap-1 text-sm font-medium">Posisi<select name="position" defaultValue={search.position ?? ""} className="min-h-11 rounded-xl border bg-white px-3">
        <option value="">Semua</option>{(positions.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
      <label className="flex flex-col gap-1 text-sm font-medium">Penanggung jawab<select name="owner" defaultValue={search.owner ?? ""} className="min-h-11 rounded-xl border bg-white px-3">
        <option value="">Semua</option>{memberIds.map((id) => <option key={id} value={id}>{people.get(id) || id}</option>)}</select></label>
      <fieldset className="sm:col-span-2 lg:col-span-3"><legend className="mb-1 text-sm font-medium">Status</legend><div className="flex flex-wrap gap-3">
        {statusOptions.map(([value,label]) => <label key={value} className="flex items-center gap-2 text-sm"><input type="checkbox" name="status" value={value} defaultChecked={allowed.includes(value)} />{label}</label>)}
      </div></fieldset>
      <div className="flex flex-wrap items-end gap-3"><button type="submit" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white">Terapkan filter</button>
        <Link href={base} className="text-sm text-primary underline">Reset</Link></div>
    </form></Panel>
    <Panel title={`Hasil · ${items.length}${items.length === 50 ? "+" : ""}`}>
      {result.error ? <p role="alert" className="text-sm text-destructive">Pencarian gagal. Coba lagi.</p> :
      items.length ? <ul className="divide-y">{items.map((item) => {
        const assignment = assignmentById.get(item.assignment_id);
        return <li key={item.id} className="py-4"><div className="flex flex-wrap items-start justify-between gap-2">
          <Link href={`/org/${slug}/handovers/${item.handover_id}/items/${item.id}`} className="font-semibold text-primary underline underline-offset-4">{item.title || "Item tanpa judul"}</Link>
          <Status value={item.status} /></div>
          <p className="mt-1 text-sm text-muted-foreground">{categoryNames.get(item.category_id)} · {assignment ? positionNames.get(assignment.position_id) : "Posisi tidak diketahui"} · Diperbarui {localDate(item.updated_at)}</p>
          {assignment ? <p className="mt-1 text-xs text-muted-foreground">Penyerah: {people.get(assignment.outgoing_user_id) || "Anggota"} · Penerima: {people.get(assignment.incoming_user_id) || "Anggota"} · {item.is_required ? "Wajib" : "Opsional"}</p> : null}
          {item.details.name ? <p className="mt-1 text-sm">{item.details.name}{item.details.affiliation ? ` · ${item.details.affiliation}` : ""}</p> : null}
          {!handoverId ? <p className="mt-1 text-xs text-muted-foreground">Handover: {periodNames.get(handoverById.get(item.handover_id)?.from_period_id ?? "") || "—"} → {periodNames.get(handoverById.get(item.handover_id)?.to_period_id ?? "") || "—"}</p> : null}
        </li>;
      })}</ul> : <Empty text="Tidak ada item yang cocok. Ubah kata kunci atau reset filter." href={base} cta="Reset filter" />}
      <div className="mt-5 flex gap-4 text-sm">{page > 1 ? <Link className="text-primary underline" href={`${base}?${query.toString()}&page=${page - 1}`}>← Sebelumnya</Link> : null}
        {items.length === 50 ? <Link className="text-primary underline" href={`${base}?${query.toString()}&page=${page + 1}`}>Berikutnya →</Link> : null}</div>
    </Panel>
  </div>;
}
