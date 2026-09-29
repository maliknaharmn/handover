# Handover KODISIA

Handover adalah web app internal untuk **transfer pengetahuan organisasi KODISIA** saat pergantian kepengurusan. Pengurus lama menyerahkan konteks kerja, aset, program, relasi stakeholder, dan tugas; pengurus baru meninjau, memverifikasi, atau meminta revisi. Admin menyiapkan struktur serta memantau progres, sementara riwayat perubahan menjaga akuntabilitas.

Pilot pertama berfokus pada KODISIA. Fondasi data tetap mendukung pemisahan antarorganisasi. Handover mencatat status dan referensi transfer akun, **bukan password atau recovery code**.

## Dokumen acuan

- [BRD](docs/BRD.md) — tujuan dan kebutuhan bisnis untuk pemangku kepentingan.
- [PRD](docs/PRD.md) — perilaku produk, aturan, dan kriteria penerimaan MVP.
- [Technical Design](docs/TECHNICAL_DESIGN.md) — arsitektur, model data, izin, dan rute.
- [Setup](docs/SETUP.md) — cara menjalankan aplikasi dan status layanan.

## Teknologi

Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase Auth/PostgreSQL/RLS, Vercel, dan GitHub.

## Menjalankan lokal

1. Pasang Node.js dan pnpm yang sesuai dengan `package.json`.
2. Salin `.env.example` menjadi `.env.local`, lalu isi URL dan publishable key proyek Supabase nonproduksi.
3. Jalankan `pnpm install` dan `pnpm dev`.
4. Buka `http://localhost:3000`.

**Status:** PRD, technical design, kerangka aplikasi, serta proyek Supabase dan Vercel pengembangan sudah disiapkan. Fitur login, database bisnis, dan workflow handover masuk fase berikutnya.
