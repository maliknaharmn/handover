import Link from "next/link";
import { requireOrg } from "@/lib/handover/context";
import { localDate } from "@/lib/handover/types";
import { Field, Feedback, Panel, Empty, SelectField, Status } from "@/components/handover/ui";
import { SubmitButton } from "@/components/handover/submit-button";
import { createHandover } from "../admin-actions";

export default async function Handovers({ params, searchParams }: {
  params: Promise<{ slug: string }>; searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { slug } = await params;
  const { supabase, org, isAdmin } = await requireOrg(slug);
  const [feedback, handovers, periods] = await Promise.all([
    searchParams,
    supabase.from("handovers").select("id,from_period_id,to_period_id,status,due_on,created_at").eq("organization_id", org.id).order("created_at", { ascending: false }),
    supabase.from("periods").select("id,label").eq("organization_id", org.id).order("label"),
  ]);
  const periodNames = new Map((periods.data ?? []).map((p) => [p.id, p.label]));
  return <div className="space-y-6"><h1 className="text-3xl font-semibold tracking-tight">Handovers</h1><Feedback {...feedback} />
    {isAdmin ? <Panel title="Buat handover"><form action={createHandover.bind(null, slug)} className="grid max-w-xl gap-4 sm:grid-cols-2">
      <SelectField label="Periode asal" name="from_period_id" options={(periods.data ?? []).map((p) => ({ value: p.id, label: p.label }))} />
      <SelectField label="Periode tujuan" name="to_period_id" options={(periods.data ?? []).map((p) => ({ value: p.id, label: p.label }))} />
      <Field label="Target selesai (opsional)" name="due_on" type="date" />
      <div className="self-end"><SubmitButton>Buat handover</SubmitButton></div>
    </form></Panel> : null}
    <Panel title="Transisi organisasi">{handovers.data?.length ? <div className="grid gap-3">{handovers.data.map((h) =>
      <Link key={h.id} href={`/org/${slug}/handovers/${h.id}`} className="rounded-xl border p-4 hover:border-primary focus-visible:outline-2 focus-visible:outline-primary">
        <div className="flex flex-wrap items-center justify-between gap-2"><strong>{periodNames.get(h.from_period_id)} → {periodNames.get(h.to_period_id)}</strong><Status value={h.status} /></div>
        <p className="mt-1 text-sm text-muted-foreground">Target: {localDate(h.due_on)}</p>
      </Link>)}</div> : <Empty text="Belum ada handover." href={isAdmin ? `/org/${slug}/settings/periods` : undefined} cta="Siapkan periode" />}</Panel>
  </div>;
}
