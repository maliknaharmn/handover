"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return <div role="alert" className="max-w-xl rounded-xl border border-destructive/25 bg-white p-6">
    <h1 className="text-2xl font-semibold">Workspace belum dapat dimuat</h1>
    <p className="mt-2 text-sm text-muted-foreground">Data belum berubah. Coba lagi; jika masalah berlanjut, hubungi admin KODISIA.</p>
    <button onClick={reset} className="mt-5 min-h-11 rounded-full bg-primary px-5 text-sm font-semibold text-white">Coba lagi</button>
  </div>;
}
