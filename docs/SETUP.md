# Setup pengembangan Handover KODISIA

**Status per 29 September 2026:** kode MVP tersedia dan migration lulus smoke test pada PostgreSQL sementara. Migration dan konfigurasi email Auth pada Supabase pengembangan belum diterapkan. Tidak ada data nyata KODISIA atau deployment production.

## Lokal

1. Gunakan Node.js yang kompatibel dengan Next.js 16 dan pnpm 11.19.0.
2. Jalankan `pnpm install`, salin `.env.example` ke `.env.local`, lalu isi URL dan publishable key Supabase pengembangan.
3. Isi `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.
4. Setelah secret key nonproduksi tersedia, isi `SUPABASE_SERVICE_ROLE_KEY` di environment server saja untuk undangan dan cron. Isi `CRON_SECRET` dengan nilai acak panjang. Jangan masukkan keduanya ke Git atau variabel `NEXT_PUBLIC_*`.
5. Jalankan `pnpm dev`. Pemeriksaan kode: `pnpm lint`, `pnpm typecheck`, `pnpm build`.

Build memakai webpack yang didukung Next.js 16 karena sandbox lokal ini melarang proses CSS Turbopack mengikat port. `.env.local` dan `.vercel` tidak dikomit.

## Layanan pengembangan

| Layanan | Konfigurasi |
| --- | --- |
| GitHub | `maliknaharmn/handover`, branch `main`. |
| Supabase | Proyek nonproduksi `handover-kodisia`, ref `yxxludlpivyqdjovbfiv`, Tokyo (`ap-northeast-1`). |
| Auth | Email aktif, konfirmasi email wajib, signup publik nonaktif. Site URL lokal `http://localhost:3000`. |
| Data API | Aktif; ekspos otomatis tabel baru nonaktif. Migration memberi grants eksplisit sesuai RLS. |
| Vercel | Proyek `handover-kodisia` di `maliknaharmns-projects`; public Supabase URL/key hanya untuk Preview dan Development. Git integration dan production deploy belum dilakukan. |

## Aktifkan database pengembangan

Jalankan file berikut **berurutan** di SQL Editor Supabase atau melalui migration CLI setelah koneksi database tersedia:

1. `supabase/migrations/202609290001_schema.sql`
2. `supabase/migrations/202609290002_security.sql`
3. `supabase/migrations/202609290003_workflow.sql`

Jangan gunakan service key di browser. Migration membuat tabel multi-organisasi, RLS, grant Data API yang eksplisit, fungsi transisi atomik, audit, serta notifikasi.

Setelah migration, tambahkan email admin awal yang telah disetujui pemilik proyek ke `public.bootstrap_allowlist` melalui SQL Editor. **Jangan komit alamat email tersebut ke repo publik.** Buat akun awal ber-email terverifikasi melalui Supabase Auth Dashboard dan berikan password sementara melalui kanal aman milik pemilik akun, lalu minta pemilik menggantinya lewat alur reset. Alternatif undangan Dashboard hanya boleh dipakai jika redirect email menuju `/auth/confirm` sudah benar. Sesudah login, akun yang ada di allowlist dapat membuat workspace KODISIA dari `/workspaces`. Proses bootstrap membuat organisasi dan admin membership dalam satu transaksi.

## Template email Auth untuk SSR

Pada Supabase Dashboard → Authentication → Email Templates, set tautan tombol masing-masing template ke:

- **Invite user:** `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=invite`
- **Magic Link:** `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=magiclink`
- **Reset Password:** `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery`

Aktifkan redirect URL tepat untuk `http://localhost:3000/auth/confirm` dan URL preview/production yang disetujui. Saat admin mengundang, aplikasi mengirim `redirectTo` ke endpoint itu. Endpoint `/auth/confirm` memverifikasi token hash dan menyimpan sesi pada cookie sebelum mengarahkan pengguna ke set password, terima undangan akun lama, atau reset password. Periksa email template uji sebelum mengundang anggota nyata. Default tautan email Supabase dapat membawa sesi di fragmen URL yang tidak tersedia bagi server.

Undangan pengguna baru memakai Auth Admin API. Untuk email yang sudah punya akun terkonfirmasi, aplikasi mengirim magic link tanpa membuat akun baru. Secret key diperlukan pada server untuk Admin API; publishable key tetap digunakan oleh browser. Masa berlaku undangan database 7 hari, sementara token email Supabase bisa lebih singkat menurut konfigurasi Auth; jika token kedaluwarsa, admin cabut lalu kirim ulang.

## Pengingat tenggat

Admin dapat menjalankan pengingat dari dashboard pengembangan. `vercel.json` menjadwalkan `/api/cron/due` setiap hari pukul 01:00 UTC untuk deployment production; endpoint dilindungi `CRON_SECRET`. Pembuatan notifikasi memakai dedupe key sehingga pemanggilan ulang tidak menumpuk pengingat yang sama. Cron Vercel baru aktif pada deployment production.

## Gerbang sebelum pilot

Jalankan [QA Plan](QA_PLAN.md) pada Supabase pengembangan dengan data sintetis dua organisasi, lalu siapkan Supabase production terpisah. Tambahkan environment production dan redirect URL sesuai domain final. Jangan gunakan proyek pengembangan ini untuk data nyata KODISIA. Data, UAT, backup/restore, pemilik operasional, dan keputusan retensi harus lolos [Pilot Runbook](PILOT_RUNBOOK.md) sebelum production deploy.
