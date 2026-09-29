import { requireAdmin } from "@/lib/handover/context";
import { localDate } from "@/lib/handover/types";
import { Field, Feedback, Panel, Empty } from "@/components/handover/ui";
import { SubmitButton } from "@/components/handover/submit-button";
import { createPeriod, updatePeriod } from "../../admin-actions";

export default async function Periods({ params, searchParams }: {
  params: Promise<{ slug: string }>; searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { slug } = await params;
  const { supabase, org } = await requireAdmin(slug);
  const [feedback, result] = await Promise.all([searchParams,
    supabase.from("periods").select("id,label,starts_on,ends_on").eq("organization_id", org.id).order("starts_on", { ascending: false })]);
  return <div className="space-y-6"><Feedback {...feedback} />
    <Panel title="Tambah periode"><form action={createPeriod.bind(null, slug)} className="grid max-w-xl gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2"><Field label="Label periode" name="label" required placeholder="2026–2027" minLength={2} /></div>
      <Field label="Tanggal mulai (opsional)" name="starts_on" type="date" />
      <Field label="Tanggal akhir (opsional)" name="ends_on" type="date" />
      <SubmitButton>Tambah periode</SubmitButton>
    </form></Panel>
    <Panel title="Daftar periode">{result.data?.length ? <ul className="divide-y">{result.data.map((p) =>
      <li key={p.id} className="py-3 text-sm"><div className="flex flex-wrap justify-between gap-2"><strong>{p.label}</strong><span className="text-muted-foreground">{localDate(p.starts_on)} – {localDate(p.ends_on)}</span></div>
        <details className="mt-2"><summary className="cursor-pointer text-primary">Ubah periode</summary>
          <form action={updatePeriod.bind(null,slug)} className="mt-3 grid max-w-xl gap-3 sm:grid-cols-2"><input type="hidden" name="id" value={p.id} />
            <div className="sm:col-span-2"><Field label="Label" name="label" defaultValue={p.label} required /></div>
            <Field label="Tanggal mulai" name="starts_on" type="date" defaultValue={p.starts_on ?? ""} />
            <Field label="Tanggal akhir" name="ends_on" type="date" defaultValue={p.ends_on ?? ""} />
            <button className="min-h-10 rounded-full border border-primary px-4 text-primary">Simpan periode</button></form>
        </details></li>)}</ul>
      : <Empty text="Belum ada periode. Buat periode asal dan tujuan untuk memulai transisi." />}</Panel>
  </div>;
}
