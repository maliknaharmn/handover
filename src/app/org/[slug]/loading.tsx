export default function Loading() {
  return <div role="status" aria-label="Memuat workspace" className="animate-pulse space-y-6">
    <div className="h-8 w-64 rounded-lg bg-muted" />
    <div className="grid gap-4 sm:grid-cols-3">{[0,1,2].map((index) => <div key={index} className="h-28 rounded-xl border bg-white p-5">
      <div className="h-4 w-24 rounded bg-muted" /><div className="mt-4 h-8 w-16 rounded bg-muted" />
    </div>)}</div>
    <div className="rounded-xl border bg-white p-5"><div className="h-5 w-40 rounded bg-muted" />
      {[0,1,2].map((index) => <div key={index} className="mt-5 h-10 rounded bg-muted" />)}</div>
    <span className="sr-only">Sedang memuat…</span>
  </div>;
}
