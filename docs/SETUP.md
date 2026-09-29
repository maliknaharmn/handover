# Setup pengembangan Handover KODISIA

**Status per 29 September 2026:** kode MVP tersedia dan migration lulus smoke test pada PostgreSQL sementara. Migration dan konfigurasi email Auth pada Supabase pengembangan belum diterapkan. Tidak ada data nyata KODISIA atau deployment production.

## Lokal

1. Gunakan Node.js yang kompatibel dengan Next.js 16 dan pnpm 11.19.0.
2. Jalankan `pnpm install`, salin `.env.example` ke `.env.local`, lalu isi URL dan publishable key Supabase pengembangan.
3. Isi `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.
4. Setelah secret key nonproduksi tersedia, isi `SUPABASE_SECRET_KEY` (`sb_secret_...`) di environment server saja untuk undangan dan cron. Isi `CRON_SECRET` dengan nilai acak panjang. Jangan masukkan keduanya ke Git atau variabel `NEXT_PUBLIC_*`.
5. Jalankan `pnpm dev`. Pemeriksaan kode: `pnpm lint`, `pnpm typecheck`, `pnpm build`.

Build memakai webpack yang didukung Next.js 16 karena sandbox lokal ini melarang proses CSS Turbopack mengikat port. `.env.local` dan `.vercel` tidak dikomit.

## Layanan pengembangan

| Layanan | Konfigurasi |
| --- | --- |
| GitHub | `maliknaharmn/handover`, branch `main`. |
| Supabase | Proyek nonproduksi `handover-kodisia`, ref `yxxludlpivyqdjovbfiv`, Tokyo (`ap-northeast-1`). |
| Auth | Email aktif, konfirmasi email wajib, signup publik nonaktif. Site URL lokal `http://localhost:3000`; redirect lokal `/auth/callback` dan `/auth/confirm` sudah diizinkan. |
| Data API | Aktif; ekspos otomatis tabel baru nonaktif. Migration memberi grants eksplisit sesuai RLS. |
| Vercel | Proyek `handover-kodisia` di `maliknaharmns-projects`; public Supabase URL/key hanya untuk Preview dan Development. Git integration dan production deploy belum dilakukan. |

## Aktifkan database pengembangan

Jalankan file berikut **berurutan** di SQL Editor Supabase atau melalui migration CLI setelah koneksi database tersedia:

1. `supabase/migrations/202609290001_schema.sql`
2. `supabase/migrations/202609290002_security.sql`
3. `supabase/migrations/202609290003_workflow.sql`

Jangan gunakan service key di browser. Migration membuat tabel multi-organisasi, RLS, grant Data API yang eksplisit, fungsi transisi atomik, audit, serta notifikasi.

Setelah migration, tambahkan email admin awal yang telah disetujui pemilik proyek ke `public.bootstrap_allowlist` melalui SQL Editor. **Jangan komit alamat email tersebut ke repo publik.** Pada Authentication → Users, buat akun awal dengan email itu dan password yang ditentukan sendiri oleh pemilik akun; pastikan status email **confirmed**. Jangan kirim password melalui chat atau masukkan ke repo. Sesudah login, akun yang ada di allowlist dapat membuat workspace KODISIA dari `/workspaces`. Proses bootstrap membuat organisasi dan admin membership dalam satu transaksi.

## Tautan email Auth

Endpoint `/auth/confirm` sekarang menerima tautan bawaan Supabase yang membawa sesi di fragmen URL, serta tautan PKCE atau `token_hash`. Pengaturan template bawaan tidak perlu diubah untuk login, reset password, dan undangan. Di Authentication → URL Configuration, gunakan Site URL `http://localhost:3000` dan izinkan redirect `http://localhost:3000/auth/confirm` serta `http://localhost:3000/auth/callback`. Dua redirect lokal itu sudah tercatat pada proyek pengembangan per 29 September 2026.

Pada paket/proyek yang sedang dipakai, editor template tidak aktif tanpa SMTP khusus atau peningkatan paket. **Pengiriman undangan ke anggota KODISIA yang bukan anggota tim proyek Supabase memerlukan SMTP khusus** melalui Authentication → Emails → SMTP Settings. Siapkan host, port, username, password SMTP, dan alamat pengirim dari penyedia email pilihan pemilik proyek. Simpan kredensial hanya di Dashboard Supabase, bukan repo atau chat. Layanan email bawaan Supabase hanya cocok untuk uji terbatas ke anggota tim proyek dan mempunyai batas pengiriman yang rendah.

Saat admin mengundang, aplikasi mengirim `redirectTo` ke endpoint `/auth/confirm`. Endpoint tersebut menyimpan sesi di cookie lalu mengarahkan pengguna baru untuk membuat password, pengguna lama untuk menerima undangan, atau penerima reset untuk mengganti password. Uji satu email ke alamat yang diizinkan sebelum mengundang anggota nyata. Tambahkan redirect URL untuk domain preview/production hanya setelah domain final tersedia.

Undangan pengguna baru memakai Auth Admin API. Untuk email yang sudah punya akun terkonfirmasi, aplikasi mengirim magic link tanpa membuat akun baru. Secret key diperlukan pada server untuk Admin API; publishable key tetap digunakan oleh browser. Masa berlaku undangan database 7 hari, sementara token email Supabase bisa lebih singkat menurut konfigurasi Auth; jika token kedaluwarsa, admin cabut lalu kirim ulang.

## Pengingat tenggat

Admin dapat menjalankan pengingat dari dashboard pengembangan. `vercel.json` menjadwalkan `/api/cron/due` setiap hari pukul 01:00 UTC untuk deployment production; endpoint dilindungi `CRON_SECRET`. Pembuatan notifikasi memakai dedupe key sehingga pemanggilan ulang tidak menumpuk pengingat yang sama. Cron Vercel baru aktif pada deployment production.

## Gerbang sebelum pilot

Jalankan [QA Plan](QA_PLAN.md) pada Supabase pengembangan dengan data sintetis dua organisasi, lalu siapkan Supabase production terpisah. Tambahkan environment production dan redirect URL sesuai domain final. Jangan gunakan proyek pengembangan ini untuk data nyata KODISIA. Data, UAT, backup/restore, pemilik operasional, dan keputusan retensi harus lolos [Pilot Runbook](PILOT_RUNBOOK.md) sebelum production deploy.
