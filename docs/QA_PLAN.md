# QA Plan — Handover KODISIA MVP

**Status per 29 September 2026:** build, TypeScript, dan lint lulus. Ketiga migration berhasil diterapkan berurutan pada PostgreSQL 18 sementara dengan stub Supabase Auth. Skenario sintetis lokal untuk bootstrap, penyerahan → revisi → verifikasi → penutupan, metrik, isolasi organisasi, penolakan ID item lintas organisasi, konflik versi, penolakan detail password, dan perlindungan admin terakhir lulus. Ini belum menggantikan uji RLS, role, email, browser, mobile, dan UAT pada layanan Supabase pengembangan.

## Lingkungan uji

Gunakan Supabase nonproduksi setelah ketiga migration diterapkan. Siapkan dua organisasi sintetis (KODISIA uji dan tenant B), minimal dua admin, dua outgoing, dua incoming, dua periode, beberapa posisi, satu handover aktif, dan satu completed. Jangan gunakan kontak/akun nyata. Jalankan aksi baik melalui UI maupun permintaan Data API langsung agar kontrol UI tidak menjadi satu-satunya pembatas.

## Gate P0

| Area | Skenario dan hasil wajib |
| --- | --- |
| Auth | Signup publik ditolak; admin awal bootstrap hanya dari email allowlist terverifikasi; invite baru dan akun lama dapat diterima; reset password berfungsi; logout menghapus akses. |
| Isolasi organisasi | Anon tidak membaca data; anggota A tidak membaca/mengubah item, komentar, log, notifikasi, metrik, atau hasil pencarian B meski ID diketahui. Akun multiorganisasi melihat data sesuai slug aktif. |
| Role | Outgoing hanya mengubah/submit item assignment sendiri; incoming lain ditolak; admin yang juga outgoing tidak dapat verify item sendiri; admin bukan penyerah dapat review dan tindakannya terlihat di audit. |
| Handover | Periode asal/tujuan berbeda; posisi dan pasangan sah; activation butuh minimal satu item wajib; hanya satu handover active per pasangan; completed butuh seluruh item wajib verified; reopen butuh alasan. |
| Item | Draft parsial → submit → revisi beralasan → edit → submit ulang → verify; status/progres konsisten. Verified tidak dapat diedit sampai reopen. Dua aksi dengan version lama menghasilkan konflik. |
| Reassignment | Incoming dinonaktifkan/role dicabut saat item terbuka ditolak sampai penugasan ulang; item ready yang dipindah kembali in progress; verified harus dibuka ulang sebelum pasangan diganti. |
| Audit dan notifikasi | Aksi sukses menghasilkan log/notifikasi yang tepat; aksi gagal tidak menghasilkan event palsu. Notifikasi hanya penerima sah; due reminder tidak terduplikasi; admin tidak dapat mengubah log. |
| Pencarian | Judul, posisi, kategori, nama/afiliasi stakeholder ditemukan di organisasi aktif; filter gabungan dan pagination benar; kontak pribadi tidak dipakai sebagai kata kunci; query khusus tidak meluaskan akses. |
| Privasi | URL hanya HTTPS tanpa token umum; form menolak pola secret umum; log tidak merekam isi item/URL/kontak; tautan eksternal jelas bahwa akses dicek manual. |
| UI | Alur setup, edit, submit, review, dashboard dapat dipakai dengan keyboard dan layar 320 px; status terbaca tanpa warna; fokus terlihat; error/empty/loading dapat dipahami. |

## Kinerja dan operasi

Uji hingga 5.000 item per organisasi dengan data sintetis; ukur p95 dashboard interaktif ≤3 detik dan p95 pencarian ≤2 detik pada kondisi pilot yang disepakati. Periksa indeks dan query plan bila lambat. Verifikasi backup dan pemulihan Supabase sesuai paket sebelum data nyata. Uji undangan email pada domain lokal/preview yang ada di allowlist, dan periksa cron hanya memakai secret server.

## Bukti QA

Catat tanggal, lingkungan, commit, pemeriksa, hasil setiap gate, screenshot layar kecil, hasil permintaan API lintas tenant, serta defect P0/P1. Tidak ada gate dianggap lulus hanya karena UI menyembunyikan tombol. Semua P0 harus selesai sebelum UAT pilot.
