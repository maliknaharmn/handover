# Setup pengembangan Handover KODISIA

**Status:** project setup selesai, 29 September 2026. Dokumen ini mencatat layanan nonproduksi dan langkah lokal. Belum ada data KODISIA, SQL migration bisnis, atau deployment pilot.

## Lokal

Gunakan Node.js yang kompatibel dengan Next.js pada `package.json` dan pnpm 11.19.0. Jalankan `pnpm install`, salin `.env.example` ke `.env.local`, isi dua variabel publik Supabase, lalu jalankan `pnpm dev`. Pemeriksaan dasar: `pnpm lint`, `pnpm typecheck`, `pnpm build`. Build menggunakan webpack yang didukung Next.js 16 karena proses CSS Turbopack tidak dapat mengikat port pada lingkungan kerja lokal ini.

`.env.local`, `.vercel`, dan semua secret tidak dikomit. Jangan menaruh service role key atau sandi database dalam variabel `NEXT_PUBLIC_*`.

## Layanan pengembangan

| Layanan | Konfigurasi saat ini |
| --- | --- |
| GitHub | Repository `maliknaharmn/handover`, branch utama `main`. |
| Supabase | Proyek `handover-kodisia`, ref `yxxludlpivyqdjovbfiv`, URL `https://yxxludlpivyqdjovbfiv.supabase.co`. Proyek ini untuk pengembangan/nonproduksi. Region yang diberikan dashboard: Tokyo (`ap-northeast-1`). |
| Supabase Auth | Email aktif dan konfirmasi email wajib; pendaftaran pengguna publik dimatikan sesuai aturan undangan admin. Site URL `http://localhost:3000`; redirect lokal `http://localhost:3000/auth/callback`. |
| Supabase Data API | Aktif; paparan otomatis tabel baru dimatikan; RLS otomatis untuk tabel baru di schema public diaktifkan. Kebijakan akses per tabel tetap harus ditulis dan diuji pada fase Foundation. |
| Vercel | Proyek `handover-kodisia` pada tim `maliknaharmns-projects`, preset Next.js. Dua variabel publik Supabase dipasang hanya untuk Preview dan Development. Belum ada deployment production atau koneksi Git otomatis. |

Kunci publishable Supabase dapat ditemukan di Dashboard → Project Settings → API Keys. Secret key tidak dibutuhkan pada fase setup. Sandi database yang dibuat saat pembuatan proyek tidak disimpan di repository atau konfigurasi lokal; saat direct connection/migration diperlukan, pemilik proyek perlu meresetnya di dashboard dan menyimpannya melalui pengelola secret yang disetujui. Jangan menggunakan proyek nonproduksi ini untuk data nyata pilot.

## Setelah setup

1. Foundation: migration, RLS, Auth undangan, organisasi, role, periode, dan posisi.
2. Tambahkan redirect Vercel yang tepat ke allowlist Auth setelah URL Preview ditetapkan. Jangan memakai wildcard domain yang lebih luas dari kebutuhan.
3. Buat proyek Supabase production terpisah sebelum pilot. Pilih region bersama pemilik data KODISIA sebelum ada data nyata; jangan menganggap region proyek pengembangan sebagai keputusan production.
4. Hubungkan GitHub ke Vercel dan lakukan deployment production hanya pada tahap pilot setelah UAT dan gerbang keamanan terpenuhi.
