export default function Home() {
  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_18%_15%,rgba(83,58,253,0.18),transparent_35%),radial-gradient(circle_at_86%_22%,rgba(104,174,255,0.18),transparent_34%)]"
      />
      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 sm:px-10">
        <header className="flex items-center justify-between border-b border-border/80 py-6">
          <span className="text-lg font-semibold tracking-tight text-[#1c1e54]">Handover</span>
          <span className="rounded-full border border-border bg-white/80 px-3 py-1 text-xs font-medium text-muted-foreground">
            KODISIA
          </span>
        </header>

        <section className="flex flex-1 flex-col justify-center py-20 sm:py-28">
          <p className="mb-6 text-sm font-semibold tracking-[0.14em] text-primary uppercase">
            Knowledge transfer workspace
          </p>
          <h1 className="max-w-4xl text-5xl font-medium tracking-[-0.055em] text-[#1c1e54] sm:text-6xl lg:text-7xl">
            Pengetahuan organisasi tetap tersambung saat kepengurusan berganti.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-muted-foreground">
            Handover membantu KODISIA menyerahkan konteks kerja, aset, program,
            dan tugas secara terstruktur. Pengurus baru dapat meninjau setiap
            item, meminta perbaikan, lalu mengonfirmasi penerimaan.
          </p>
          <p className="mt-10 inline-flex w-fit items-center rounded-full border border-primary/25 bg-white/85 px-6 py-3 text-sm font-medium text-primary shadow-sm">
            Pilot internal dalam persiapan
          </p>
        </section>

        <footer className="border-t border-border/80 py-6 text-sm text-muted-foreground">
          Dibangun untuk kontinuitas pengetahuan KODISIA.
        </footer>
      </div>
    </main>
  );
}
