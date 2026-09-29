import type { Metrics } from "@/lib/handover/data";

export function Progress({ verified, total }: { verified: number; total: number }) {
  const percentage = total ? Math.round(verified / total * 100) : 0;
  return <div className="tabular-nums"><div className="mb-2 flex items-baseline justify-between gap-2 text-sm">
    <strong>{total ? `${percentage}%` : "Belum ada item wajib"}</strong><span className="text-muted-foreground">{verified}/{total} verified</span>
  </div><div role="progressbar" aria-label="Progres item wajib" aria-valuenow={verified} aria-valuemin={0} aria-valuemax={total}
    className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${percentage}%` }} /></div></div>;
}

export function MetricsView({ metrics }: { metrics: Metrics }) {
  const m = metrics.overall;
  return <div className="space-y-6"><Progress verified={m.required_verified} total={m.required_total} />
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[
      ["Menunggu review", m.waiting_review], ["Perlu revisi", m.revision_required],
      ["Dikerjakan", m.in_progress], ["Belum dimulai", m.not_started],
      ["Terlambat", m.overdue], ["Opsional tertunda", m.optional_outstanding],
    ].map(([label, value]) => <div key={label} className="rounded-xl bg-background p-3"><dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-xl font-semibold">{value}</dd></div>)}</dl>
    <div className="grid gap-5 sm:grid-cols-2">{([["Per posisi", metrics.positions], ["Per kategori", metrics.categories]] as const).map(([title, groups]) =>
      <div key={title}><h3 className="mb-2 text-sm font-semibold">{title}</h3><ul className="space-y-2 text-sm">{groups.map((group) =>
        <li key={group.name} className="flex justify-between gap-3 border-b py-1"><span>{group.name}</span><span>{group.required_verified}/{group.required_total}</span></li>)}</ul></div>)}</div>
  </div>;
}
