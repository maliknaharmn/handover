# Pilot dan deployment — Handover KODISIA

**Status:** rencana; belum ada data KODISIA nyata, UAT, ataupun deployment production.

## Persiapan

1. Tetapkan pemilik pilot KODISIA, admin cadangan, penanggung jawab data/kontak stakeholder, dan kanal dukungan.
2. Putuskan format label periode serta pemilik permintaan ekspor/penghapusan data. Pilih region Supabase production bersama pemilik data.
3. Siapkan daftar dua periode, 3–5 posisi, 2–3 anggota per role, dan 20–50 item awal yang disetujui. Jangan masukkan password, recovery code, token, atau data kontak tanpa dasar izin.
4. Buat proyek Supabase production terpisah. Terapkan migration yang telah lolos QA, konfigurasi email/redirect/secret, dan uji backup serta restore.
5. Hubungkan GitHub ke Vercel. Pisahkan environment Preview dan Production; verifikasi hanya key publik masuk client bundle. Siapkan URL/domain final dan `CRON_SECRET`.

## UAT dan go/no-go

Admin, outgoing, dan incoming menjalankan semua 12 acceptance criteria PRD dengan data pilot realistis. Uji khusus review/revisi, larangan verifikasi sendiri, isolasi tenant kedua, mobile, dan pemulihan error. Perbaiki seluruh defect P0; P1 didokumentasikan dengan owner dan tanggal. Pastikan tidak ada jalur kebocoran lintas organisasi, penyimpanan secret, atau status ganda.

**Go** hanya jika QA P0 lulus, data pilot disetujui admin, backup/restore terbukti, admin cadangan aktif, email undangan bekerja, dan pemilik operasional siap. Selain itu **no-go**; tunda data nyata dan production deploy.

## Rilis terbatas dan evaluasi

Undang anggota pilot bertahap, aktifkan satu transisi nyata, pantau error dan item terhambat setiap minggu. Ukur completion, verification rate, waktu review, revision rate, aset hilang, adoption per posisi, dan durasi transisi menurut PRD. Evaluasi sesudah satu siklus; keputusan memperluas produk mengikuti data pilot dan kebijakan retensi yang disetujui.
