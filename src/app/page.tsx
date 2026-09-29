import Link from "next/link";

export default function Home() {
  return (
    <main className="relative isolate flex min-h-[100dvh] flex-col overflow-hidden bg-white text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[43rem] bg-[radial-gradient(ellipse_at_12%_24%,rgba(245,233,212,0.9),transparent_39%),radial-gradient(ellipse_at_83%_12%,rgba(83,58,253,0.26),transparent_35%),radial-gradient(ellipse_at_76%_50%,rgba(216,82,130,0.17),transparent_31%),radial-gradient(ellipse_at_40%_80%,rgba(254,169,100,0.16),transparent_36%)]"
      />
      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 sm:px-10">
        <header className="flex items-center justify-between border-b border-border/80 py-6">
          <span className="text-xl font-semibold tracking-tight text-[var(--brand-dark)]">Handover</span>
          <Link href="/login" className="min-h-11 rounded-full border border-primary px-5 py-3 text-sm font-semibold text-primary hover:bg-accent">Masuk</Link>
        </header>

        <section className="flex flex-1 flex-col justify-center py-20 sm:py-28">
          <p className="mb-6 text-sm font-semibold tracking-[0.14em] text-primary uppercase">
            Sistem transfer pengetahuan KODISIA
          </p>
          <h1 className="max-w-4xl text-5xl font-normal tracking-[-0.045em] text-[var(--brand-dark)] sm:text-6xl lg:text-7xl">
            Pengetahuan tetap tersambung saat kepengurusan berganti.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-[var(--ink-secondary)]">
            Serahkan konteks kerja, aset, program, relasi, dan tugas secara terstruktur. Pengurus baru meninjau dan memverifikasi setiap item.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4"><Link href="/login" className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-primary-deep)]">Masuk ke workspace →</Link>
            <a href="#cara-kerja" className="text-sm font-medium text-primary underline underline-offset-4">Lihat cara kerja</a></div>
        </section>

        <section id="cara-kerja" className="grid gap-8 border-t border-border py-16 sm:grid-cols-[1fr_2fr] sm:py-24">
          <div><p className="text-sm font-semibold uppercase tracking-widest text-primary">Alur kerja</p>
            <h2 className="mt-4 text-3xl font-medium tracking-tight text-[var(--brand-dark)]">Dari penyerahan sampai penerimaan.</h2></div>
          <ol className="divide-y border-y border-border text-sm sm:text-base">
            <li className="grid gap-2 py-5 sm:grid-cols-[2rem_1fr]"><span className="font-semibold text-primary">01</span><span><strong>Admin menyiapkan transisi.</strong> Periode, posisi, pasangan pengurus, dan checklist diberi pemilik yang jelas.</span></li>
            <li className="grid gap-2 py-5 sm:grid-cols-[2rem_1fr]"><span className="font-semibold text-primary">02</span><span><strong>Pengurus lama menyerahkan konteks.</strong> Catatan dan referensi tersimpan pada item yang dapat ditelusuri.</span></li>
            <li className="grid gap-2 py-5 sm:grid-cols-[2rem_1fr]"><span className="font-semibold text-primary">03</span><span><strong>Pengurus baru memeriksa.</strong> Mereka memverifikasi atau meminta revisi; progres dihitung dari item yang terverifikasi.</span></li>
          </ol>
        </section>

        <footer className="border-t border-border py-6 text-sm text-muted-foreground">
          Handover · KODISIA
        </footer>
      </div>
    </main>
  );
}
