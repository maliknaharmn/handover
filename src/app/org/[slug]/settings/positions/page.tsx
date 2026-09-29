import { requireAdmin } from "@/lib/handover/context";
import { Field, Feedback, Panel, Empty, SelectField } from "@/components/handover/ui";
import { SubmitButton } from "@/components/handover/submit-button";
import { assignPosition, createPosition, removePositionAssignment, updatePosition } from "../../admin-actions";

export default async function Positions({ params, searchParams }: {
  params: Promise<{ slug: string }>; searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { slug } = await params;
  const { supabase, org } = await requireAdmin(slug);
  const [feedback, positions, periods, members, assignments] = await Promise.all([
    searchParams,
    supabase.from("positions").select("id,name,division,is_active").eq("organization_id", org.id).order("name"),
    supabase.from("periods").select("id,label").eq("organization_id", org.id).order("label"),
    supabase.from("organization_members").select("user_id,roles").eq("organization_id", org.id).eq("is_active", true),
    supabase.from("position_assignments").select("period_id,position_id,user_id").eq("organization_id", org.id),
  ]);
  const ids = members.data?.map((m) => m.user_id) ?? [];
  const { data: profiles } = ids.length ? await supabase.from("profiles").select("id,display_name").in("id", ids) : { data: [] };
  const names = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));
  const periodNames = new Map((periods.data ?? []).map((p) => [p.id, p.label]));
  return <div className="space-y-6"><Feedback {...feedback} />
    <Panel title="Tambah posisi"><form action={createPosition.bind(null, slug)} className="grid max-w-xl gap-4">
      <Field label="Nama jabatan" name="name" required minLength={2} />
      <Field label="Divisi (opsional)" name="division" />
      <SubmitButton>Tambah posisi</SubmitButton></form></Panel>
    <Panel title="Tempatkan anggota pada periode"><form action={assignPosition.bind(null, slug)} className="grid max-w-xl gap-4">
      <SelectField label="Periode" name="period_id" options={(periods.data ?? []).map((p) => ({ value: p.id, label: p.label }))} />
      <SelectField label="Posisi" name="position_id" options={(positions.data ?? []).map((p) => ({ value: p.id, label: p.name }))} />
      <SelectField label="Anggota" name="user_id" options={(members.data ?? []).map((m) => ({ value: m.user_id, label: `${names.get(m.user_id) || m.user_id} (${m.roles.join(", ")})` }))} />
      <SubmitButton>Simpan penempatan</SubmitButton></form></Panel>
    <Panel title="Struktur dan penempatan">{positions.data?.length ? <div className="space-y-5">{positions.data.map((p) =>
      <div key={p.id} className="border-b pb-4"><h3 className="font-semibold">{p.name}{p.division ? ` · ${p.division}` : ""}</h3>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">{(assignments.data ?? []).filter((a) => a.position_id === p.id).map((a) =>
          <li key={`${a.period_id}-${a.position_id}-${a.user_id}`} className="flex flex-wrap items-center justify-between gap-2">{periodNames.get(a.period_id)} · {names.get(a.user_id) || a.user_id}
            <form action={removePositionAssignment.bind(null,slug)}><input type="hidden" name="period_id" value={a.period_id} />
              <input type="hidden" name="position_id" value={a.position_id} /><input type="hidden" name="user_id" value={a.user_id} />
              <button className="text-xs text-destructive underline">Hapus penempatan</button></form></li>)}</ul>
        <details className="mt-2 text-sm"><summary className="cursor-pointer text-primary">Ubah posisi</summary>
          <form action={updatePosition.bind(null,slug)} className="mt-3 grid max-w-xl gap-3"><input type="hidden" name="id" value={p.id} />
            <Field label="Nama" name="name" defaultValue={p.name} required />
            <Field label="Divisi" name="division" defaultValue={p.division ?? ""} />
            <label className="flex items-center gap-2"><input type="checkbox" name="is_active" defaultChecked={p.is_active} />Posisi aktif</label>
            <button className="min-h-10 w-fit rounded-full border border-primary px-4 text-primary">Simpan posisi</button>
          </form></details>
      </div>)}</div> : <Empty text="Belum ada posisi." />}</Panel>
  </div>;
}
