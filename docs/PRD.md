# Product Requirements Document — Handover

- **Produk:** Handover — Organizational Knowledge & Leadership Transition System
- **Versi:** 1.2 · 29 September 2026
- **Status:** Baseline MVP KODISIA; keputusan produk utama dikunci untuk technical design
- **Pemilik keputusan produk:** Product owner
- **Target awal:** KODISIA sebagai pilot pertama; fondasi data tetap mendukung organisasi lain di masa depan
- **Bahasa antarmuka MVP:** Bahasa Indonesia

## 1. Ringkasan keputusan

Handover adalah workspace privat untuk merencanakan, menyerahkan, memeriksa, dan menelusuri pengetahuan serta aset organisasi antarperiode. Unit kerja utamanya adalah **item handover** yang punya penanggung jawab outgoing, penerima incoming, bukti atau referensi, status review, dan riwayat perubahan. Satu handover menghubungkan dua periode dalam organisasi yang sama. Progres berarti proporsi item wajib yang **sudah diverifikasi**, bukan sekadar diisi atau dikirim.

MVP dijalankan untuk **transfer pengetahuan KODISIA**. Antarmuka onboarding pilot dibatasi untuk KODISIA, sementara pemisahan data per organisasi tetap menjadi fondasi produk.

Stack implementasi yang telah dipilih: **Next.js + TypeScript + Tailwind CSS + shadcn/ui + Supabase Auth/PostgreSQL/RLS + Vercel + GitHub**. PRD ini menentukan perilaku produk; skema SQL, detail kebijakan RLS, dan rancangan komponen menjadi keluaran technical design berikutnya. Upload berkas native, integrasi pihak ketiga, dan email/WhatsApp otomatis tidak termasuk MVP.

### Prinsip keputusan

1. Satu organisasi tidak boleh membaca atau mengubah data organisasi lain, termasuk melalui URL langsung, pencarian, atau API.
2. Item dinyatakan selesai hanya setelah penerima yang berwenang memverifikasinya.
3. Penyerah tidak boleh memverifikasi item yang ia serahkan, meski ia juga memiliki role lain.
4. Rahasia akun tidak disimpan di Handover; produk mencatat kepemilikan, langkah transfer, dan referensi ke kanal aman.
5. Jejak audit harus menjelaskan siapa melakukan apa, kapan, pada organisasi/handover/item mana.

## 2. Visi dan masalah

**Visi:** Pengetahuan organisasi tetap dapat ditemukan, dipahami, dan ditindaklanjuti ketika pengurus berganti. Dalam jangka panjang, Handover menjadi memori organisasi yang terstruktur.

Saat transisi, dokumen, akses akun, SOP, relasi stakeholder, pengalaman program, dan pekerjaan tertunda tersebar pada orang atau layanan berbeda. Checklist informal tidak menunjukkan apakah penerima benar-benar memperoleh dan memahami aset. Admin sulit mengetahui hambatan, sedangkan pengurus baru harus mengulang pencarian atau menghubungi pengurus lama. Handover menyediakan proses yang terlihat, dapat diverifikasi, dan memiliki riwayat.

### Goals MVP

| ID | Hasil yang dituju |
| --- | --- |
| G1 | Admin dapat menyiapkan satu organisasi, dua periode, posisi, anggota, assignment, dan handover tanpa bantuan developer. |
| G2 | Outgoing dapat menuntaskan item yang menjadi tanggung jawabnya dan mengirimnya untuk review. |
| G3 | Incoming dapat menemukan item yang perlu ditinjau, memverifikasi, atau meminta revisi dengan alasan. |
| G4 | Admin dan anggota dapat melihat progres, item terhambat, dan riwayat yang sesuai hak akses. |
| G5 | Satu organisasi pilot dapat menyelesaikan transisi nyata end-to-end tanpa kebocoran data lintas organisasi. |

### Non-goals MVP

Handover tidak menjadi penyimpan password, pengganti Google Drive, sistem project management penuh, chat, tanda tangan digital, atau alat penilaian kinerja pengurus. Persentase completion hanya mengukur proses di aplikasi.

## 3. Pengguna, role, dan kepemilikan

| Persona | Kebutuhan utama | Hambatan yang diatasi |
| --- | --- | --- |
| Admin organisasi | Menyiapkan transisi, membagi tanggung jawab, memantau serta menutup handover | Tidak tahu siapa memegang item dan mana yang tertahan |
| Outgoing officer | Menjelaskan aset/pekerjaan, memberi referensi, menanggapi revisi | Pengetahuan tersebar, permintaan berulang |
| Incoming officer | Memeriksa kelengkapan, meminta perbaikan, mengonfirmasi penerimaan | Menerima daftar tanpa bukti atau konteks |

Role berlaku **per organisasi**, bukan global. Satu akun dapat menjadi anggota lebih dari satu organisasi. `admin`, `outgoing`, dan `incoming` adalah role workspace MVP. Assignment pada **posisi dan handover tertentu** menentukan hak mengedit atau mereview item; role saja tidak memberikan hak terhadap semua item. Admin dapat memegang lebih dari satu role dalam organisasi, tetapi larangan self-verification tetap berlaku. Akun yang dinonaktifkan kehilangan akses organisasi sejak perubahan efektif; riwayat aktivitasnya tetap tersimpan.

## 4. User journeys

1. **Setup:** admin membuat organisasi → menetapkan nama dan identitas → membuat periode asal dan tujuan → posisi/divisi → mengundang atau menambahkan anggota → mengaitkan anggota ke posisi pada masing-masing periode → membuat handover dan pasangan outgoing/incoming → membuat kategori dan item wajib/opsional → membuka handover.
2. **Serah terima:** outgoing membuka daftar tugasnya → mengisi deskripsi, catatan, referensi, dan detail kategori → menyimpan draft → memastikan item lengkap → mengirim untuk review. Incoming melihat tugas review baru.
3. **Review:** incoming membuka item dan referensinya → memverifikasi atau mengembalikan dengan alasan spesifik → outgoing menerima revisi, memperbarui item, lalu mengirim ulang. Setiap keputusan tercatat.
4. **Monitoring dan penutupan:** admin menyaring item berdasarkan posisi, kategori, status, dan owner → menangani hambatan di luar aplikasi → ketika semua item wajib verified, menutup handover secara eksplisit. Riwayat tetap dapat dibaca.
5. **Temu kembali:** anggota organisasi mencari item yang pernah dibagikan dan membuka detailnya sesuai organisasi yang sedang aktif.

## 5. Cakupan dan prioritas

**P0 / harus ada untuk pilot:** autentikasi, onboarding organisasi dan admin awal, anggota/role, periode/posisi/assignment, pembuatan handover, kategori, template checklist sederhana, item wajib/opsional, referensi URL dan catatan, status dan review, komentar revisi, dashboard progres, pencarian informasi item termasuk stakeholder, notifikasi di aplikasi, activity log, isolasi organisasi, tampilan responsif dan aksesibel.

**P1 / sesudah pilot bila tervalidasi:** template lintas organisasi dan versioning, pengingat terjadwal yang lebih kaya, ekspor laporan, upload berkas melalui Supabase Storage, analytics lebih rinci.

**Di luar MVP:** AI summary, integrasi Google Drive/WhatsApp/email, penyimpanan kredensial, migrasi dokumen otomatis, aplikasi native, tanda tangan digital, chat real-time, profil publik, billing, workflow approval bertingkat.

## 6. Kebutuhan fungsional

Setiap ID menjadi acuan acceptance test. Semua operasi yang membaca atau mengubah data harus memvalidasi keanggotaan organisasi dan otorisasi di sisi server/database, termasuk bila kontrol UI tidak terlihat.

### Identitas dan workspace

| ID | Requirement |
| --- | --- |
| FR-01 | Anggota KODISIA bergabung hanya melalui undangan admin, kemudian dapat login, logout, dan mereset password melalui Supabase Auth. Tidak ada pendaftaran publik atau pembuatan organisasi mandiri pada pilot. Akses baru diberikan setelah identitas undangan valid. |
| FR-02 | Admin awal menyiapkan workspace KODISIA dengan nama, logo opsional, slug, dan dirinya sebagai admin. Proses bootstrap harus atomik dari sudut pengguna: gagal berarti tidak ada workspace tanpa admin. Model data tetap mendukung organisasi lain kelak. |
| FR-03 | Anggota multiorganisasi dapat memilih dan berpindah workspace; konteks organisasi aktif selalu terlihat. Tidak ada data dua organisasi tercampur dalam satu daftar, hitungan, atau hasil pencarian. |
| FR-04 | Admin dapat mengundang/menambahkan anggota melalui email, menetapkan role, melihat status undangan/keanggotaan, mengubah role, dan menonaktifkan akses. Admin terakhir tidak boleh menonaktifkan dirinya atau dicabut rolenya sebelum admin pengganti ada. |

### Struktur dan handover

| ID | Requirement |
| --- | --- |
| FR-05 | Admin dapat membuat/mengubah periode berlabel jelas dan urutan waktu; periode asal dan tujuan untuk satu handover harus berbeda serta berada di organisasi yang sama. |
| FR-06 | Admin dapat mengelola posisi/divisi dan menetapkan satu atau lebih officer ke posisi pada periode tertentu. Riwayat assignment periode lama dipertahankan. |
| FR-07 | Admin dapat membuat handover asal → tujuan, menentukan tanggal target opsional, dan mengaitkan pasangan penanggung jawab outgoing/incoming per posisi. Handover tetap `draft` sampai assignment dan setidaknya satu item wajib siap. Hanya satu handover `active` untuk pasangan periode yang sama dalam organisasi. |
| FR-08 | Admin dapat membuka handover (`active`), menutup (`completed`) setelah syarat terpenuhi, dan melihat handover terdahulu. Handover completed bersifat baca saja bagi semua role; pembukaan kembali hanya oleh admin dan wajib beralasan serta tercatat. |
| FR-09 | Admin dapat membuat kategori dalam handover. Default awal: Accounts, Documents, Programs, Stakeholders, Tasks; label dapat disesuaikan. Perubahan kategori tidak mengubah status item. |
| FR-10 | Admin membuat dan mengelola checklist item, menandai wajib/opsional, mengaitkan kategori, posisi, outgoing, incoming, dan target tanggal opsional. Sebuah item wajib harus punya outgoing dan incoming yang berbeda sebelum handover active. |
| FR-10a | Admin dapat menyimpan checklist organisasi sebagai template sederhana dan menyalin item/kategori template ke handover baru. Hasil salinan menjadi item handover independen agar perubahan template tidak mengubah handover berjalan atau historis. |

### Item dan review

| ID | Requirement |
| --- | --- |
| FR-11 | Outgoing yang ditugaskan dapat membuat/mengubah isi item saat `not_started`, `in_progress`, atau `revision_required`, termasuk judul, deskripsi, catatan, URL referensi, dan rincian kategori. Tautan harus berformat aman dan jelas tujuan/labelnya. |
| FR-12 | Sistem menyediakan rincian terstruktur yang relevan: Accounts (jenis aset, owner saat ini, status transfer, referensi kanal aman); Documents (nama, versi/tahun, URL, deskripsi, owner, status transfer); Programs (tujuan, jadwal, SOP/referensi, hasil/evaluasi, rekomendasi); Stakeholders (nama, afiliasi, peran, kontak yang diizinkan, konteks relasi, catatan komunikasi); Tasks (deskripsi, owner, tenggat, prioritas, catatan, status pekerjaan). Field minimum per kategori ditetapkan pada form dan divalidasi sebelum review. |
| FR-13 | Outgoing dapat menyimpan draft parsial. Pengiriman `ready_for_review` mengharuskan judul, kategori, outgoing, incoming, dan isi inti atau referensi yang dapat dinilai. Akun digital juga harus menyatakan status transfer; sistem tidak meminta password. |
| FR-14 | Incoming yang ditugaskan dapat memverifikasi item `ready_for_review` atau meminta revisi dengan komentar alasan wajib. Sesuai BRD, admin organisasi juga dapat mengambil keputusan review pada item organisasinya jika bukan outgoing/penyerah item tersebut; keputusan atas nama admin diberi label jelas dan diaudit. Penyerah tidak dapat memverifikasi item sendiri walaupun ia admin. |
| FR-15 | Outgoing dapat merespons revisi, mengubah item, lalu mengirim ulang. Item `ready_for_review` dan `verified` tidak bisa diedit biasa. Jika perubahan material diperlukan setelah verified, admin membuka kembali item dengan alasan; status kembali `in_progress`, verifikasi lama tetap terlihat dalam audit, dan progres dihitung ulang. |
| FR-16 | Outgoing, incoming, dan admin yang terkait dapat memberi komentar pada item aktif. Komentar revisi wajib terkait keputusan `revision_required`; komentar biasa tidak mengubah status. Tidak ada edit/hapus komentar bagi pengguna pada MVP agar riwayat tetap jelas. |

### Visibilitas dan akuntabilitas

| ID | Requirement |
| --- | --- |
| FR-17 | Dashboard organisasi menampilkan handover aktif, jumlah item wajib, verified, waiting review, revision required, in progress/not started, item terlambat, dan progres keseluruhan serta per posisi/kategori. Angka berasal dari status tersimpan, bukan cache UI yang berbeda. |
| FR-18 | Halaman “Tugas saya” menampilkan item yang perlu diisi oleh outgoing dan item yang perlu direview oleh incoming, dengan jumlah serta tautan ke detail; indikator diperbarui setelah perubahan status. |
| FR-19 | Anggota dapat mencari informasi item dalam organisasi aktif berdasarkan judul, deskripsi/catatan yang aman ditampilkan, kategori, nama posisi, serta nama/afiliasi stakeholder atau vendor yang tercatat. Hasil dibatasi pada data yang boleh dibaca. Filter status, handover, posisi, kategori, dan owner dapat digabung; urutan default aktivitas terbaru. |
| FR-20 | Activity log mencatat pembuatan/perubahan organisasi penting, keanggotaan/role, periode/posisi/assignment, pembukaan/penutupan handover, pembuatan/perubahan item, perubahan required flag, perpindahan status, komentar revisi, dan penggantian reviewer. Entri tampil dalam handover/item dan dapat disaring per tanggal/aktor. |
| FR-21 | Tautan referensi eksternal dapat dibuka dengan label jelas; sistem tidak mengklaim atau otomatis memvalidasi bahwa akses eksternal berhasil. Incoming mengonfirmasi secara manual saat verify. |
| FR-22 | Sistem menampilkan notifikasi di dalam aplikasi untuk item baru ditugaskan, item siap direview, revisi diminta, item diverifikasi, dan tenggat mendekat. Notifikasi memiliki penerima, waktu, tautan tujuan, dan status sudah/belum dibaca; penerima hanya dapat melihat notifikasi miliknya dalam organisasi yang berhak ia akses. Email dan WhatsApp belum termasuk MVP. |

## 7. Aturan bisnis dan izin

### Matriks izin MVP

| Aksi | Admin | Outgoing assigned | Incoming assigned | Member lain |
| --- | --- | --- | --- | --- |
| Baca data organisasi sendiri | Ya | Ya | Ya | Ya, jika member |
| Kelola organisasi, anggota, periode, posisi, assignment | Ya | Tidak | Tidak | Tidak |
| Buat/buka/tutup handover dan checklist | Ya | Tidak | Tidak | Tidak |
| Ubah konten item aktif | Ya untuk koreksi administratif dengan alasan audit; atau sebagai outgoing assigned | Ya | Tidak | Tidak |
| Submit item untuk review | Jika juga outgoing assigned | Ya | Tidak | Tidak |
| Verify / request revision | Ya pada item organisasi sendiri jika bukan penyerah; keputusan atas nama admin diaudit | Tidak | Ya, jika incoming assigned dan bukan penyerah | Tidak |
| Komentar item | Ya | Ya pada item terkait | Ya pada item terkait | Tidak |
| Lihat dashboard/activity log organisasi | Ya | Ya | Ya | Ya, jika member |

Admin tidak bisa memakai hak manajemen untuk melewati aturan pemisahan penyerah dan penerima. Setiap item tetap memerlukan incoming assigned sebagai penerima utama; admin dapat membantu review jika bukan penyerah. Perubahan assignment ketika item menunggu review mengembalikan item ke `in_progress` agar penerima baru dapat menilai ulang dari awal. Penonaktifan anggota yang memiliki item terbuka menuntut reassignment oleh admin; data dan audit lama tidak hilang.

### Aturan operasional

| ID | Aturan |
| --- | --- |
| BR-01 | Setiap handover menghubungkan tepat satu periode asal dan satu periode tujuan dalam organisasi yang sama. |
| BR-02 | Item wajib memiliki posisi/assignment, outgoing, incoming berbeda, dan kategori sebelum handover dibuka. |
| BR-03 | Satu item hanya memiliki satu status utama; review decision tidak disimpan sebagai boolean terpisah yang bersaing. |
| BR-04 | Incoming assigned atau admin organisasi dapat verify atau request revision, sepanjang aktor bukan penyerah item. Keputusan admin dicatat sebagai tindakan admin. |
| BR-05 | Handover dapat completed jika **semua item wajib** verified, ada minimal satu item wajib, dan tidak ada item wajib tanpa assignment; item opsional yang belum selesai tetap terlihat sebagai outstanding. |
| BR-06 | Mengubah item wajib menjadi opsional, menghapus item, atau mengganti reviewer setelah handover active memerlukan alasan dan entri audit. Item verified tidak dihapus; gunakan penandaan tidak aktif oleh admin dengan alasan, dikeluarkan dari denominator setelah perubahan dan tercatat. |
| BR-07 | Semua timestamp disimpan konsisten dan ditampilkan dalam zona waktu workspace (default Asia/Jakarta untuk pilot), dengan format tanggal yang jelas. |
| BR-08 | Password, token, recovery code, dan secret lain tidak boleh diketik atau disimpan dalam item/komentar. UI memberi peringatan dan panduan memakai password manager/kanal aman; validasi otomatis hanya lapisan tambahan, bukan jaminan mendeteksi semua rahasia. |
| BR-09 | Handover completed tetap dapat dicari dan dibaca anggota organisasi selama mereka masih berhak. |
| BR-10 | Pada satu organisasi, hanya satu handover untuk pasangan periode yang sama boleh berstatus `active`; aktivasi lain ditolak secara atomik. |
| BR-11 | Kontak stakeholder yang disetujui untuk dicatat dapat dibaca semua anggota organisasi yang aktif; anggota nonaktif dan organisasi lain tidak mendapat akses. |

## 8. Status dan transisi

**Status handover:** `draft → active → completed`; `completed → active` hanya oleh admin melalui reopen beralasan. Handover draft dapat diedit admin; item baru menerima pekerjaan outgoing setelah active. Handover completed baca saja sampai reopen.

**Status item:**

| Dari | Ke | Pelaku dan syarat |
| --- | --- | --- |
| `not_started` | `in_progress` | Outgoing assigned mulai mengisi atau menyimpan draft. |
| `in_progress` | `ready_for_review` | Outgoing assigned; validasi isi minimum dan incoming aktif lulus. |
| `ready_for_review` | `verified` | Incoming assigned atau admin organisasi yang berbeda dari penyerah; catat aktor dan waktu. |
| `ready_for_review` | `revision_required` | Incoming assigned atau admin organisasi yang berbeda dari penyerah; alasan wajib. |
| `revision_required` | `in_progress` | Outgoing assigned memulai perbaikan. |
| `in_progress` | `ready_for_review` | Outgoing mengirim ulang setelah revisi. |
| `verified` | `in_progress` | Admin reopen item dengan alasan; verifikasi historis tetap di audit. |

Alur revisi dalam BRD diringkas sebagai `ready_for_review → revision_required → ready_for_review`. Pada level operasional, outgoing memasuki `in_progress` ketika mulai memperbaiki lalu mengirim ulang; tahap antara ini memungkinkan draft revisi tersimpan. Transisi lain ditolak dengan pesan yang menjelaskan status saat ini dan langkah sah berikutnya. Dua aksi serentak pada item yang sama tidak boleh menghasilkan status ganda: perubahan kedua harus mendapat konflik dan memuat ulang status terbaru.

## 9. Konsep data tingkat produk

Konsep berikut menjelaskan makna, belum menentukan tabel/kolom SQL.

| Konsep | Makna dan hubungan penting |
| --- | --- |
| User/Profile | Identitas login dan nama tampilan; satu user bisa bergabung di banyak organisasi. |
| Organization/Membership | Batas privasi; membership memuat role dan status aktif. |
| Period | Rentang kepengurusan milik organisasi; handover menghubungkan dua periode. |
| Position/Position assignment | Struktur jabatan/divisi dan siapa menjabat pada periode tertentu; mendukung lebih dari satu officer bila diperlukan. |
| Handover/Handover assignment | Proses transisi dan pasangan penyerah/penerima per posisi. |
| Checklist template/Category/Item | Template organisasi untuk pemakaian ulang; pengelompokan serta unit serah terima, required flag, konten, owner, reviewer, status, tanggal target. |
| Comment | Diskusi item dan alasan revisi; terkait penulis dan waktu. |
| Activity event | Jejak perubahan penting dengan aktor, entitas, jenis aksi, nilai aman sebelum/sesudah bila relevan, dan waktu. |
| Notification | Pemberitahuan in-app kepada anggota tertentu mengenai assignment, review, revisi, verifikasi, atau tenggat; status baca tidak memengaruhi status item. |

Verifikasi MVP adalah **keadaan dan metadata pada item**, bukan objek produk terpisah. Detail bentuk penyimpanan ditentukan pada technical design. URL referensi adalah pointer, bukan salinan dokumen. Kontak stakeholder merupakan data pribadi yang hanya boleh dicatat bila organisasi punya alasan dan izin yang layak; hindari data sensitif yang tidak diperlukan.

## 10. Information architecture dan inventory layar

Rute berikut adalah kontrak navigasi produk yang dapat disesuaikan sedikit pada technical design tanpa mengubah cakupan.

| Rute konseptual | Layar | Akses / pekerjaan utama |
| --- | --- | --- |
| `/` | Landing ringkas | Publik; proposisi nilai dan CTA masuk bagi anggota yang diundang. |
| `/login`, `/auth/invite`, `/reset-password` | Auth | Login dan pemulihan; penerimaan undangan admin dengan token yang sah. Tidak ada pendaftaran publik. |
| `/workspaces` | Pemilih organisasi | Pengguna login; memilih membership aktif. Pembuatan organisasi baru hanya melalui bootstrap terkontrol. |
| `/org/[slug]/overview` | Dashboard | Member; progres, tugas dan hambatan. |
| `/org/[slug]/my-tasks` | Tugas saya | Member; item outgoing/incoming yang relevan. |
| `/org/[slug]/handovers` | Daftar handover | Member; aktif dan arsip. |
| `/org/[slug]/handovers/[id]` | Ringkasan handover | Member; progres, posisi, kategori, status. |
| `/org/[slug]/handovers/[id]/items` | Daftar item | Member; cari, filter, sort. |
| `/org/[slug]/handovers/[id]/items/[itemId]` | Detail item | Member; konten, referensi, komentar, aksi sesuai assignment. |
| `/org/[slug]/handovers/[id]/activity` | Aktivitas | Member; event handover. |
| `/org/[slug]/settings` | Pengaturan organisasi | Admin; identitas. |
| `/org/[slug]/settings/members` | Anggota | Admin; undang, role, nonaktifkan. |
| `/org/[slug]/settings/periods` | Periode | Admin; kelola periode. |
| `/org/[slug]/settings/positions` | Posisi dan assignment | Admin; struktur dan penempatan. |
| `/org/[slug]/settings/templates` | Template checklist | Admin; buat, ubah, dan pakai ulang checklist. |
| `/org/[slug]/notifications` | Notifikasi | Member; daftar notifikasi pribadi dan tautan ke item. |

Pembuatan/edit handover, kategori, dan checklist dapat berupa layar turunan atau dialog bila aksesibilitas dan URL navigasi tetap memadai. Navigasi utama menonjolkan Overview, Tugas Saya, Handovers, dan Settings (admin). Pada mobile, aksi review dan informasi status harus mudah ditemukan tanpa tabel lebar.

## 11. Pencarian, indikator, dan metrik dashboard

Pencarian MVP hanya dalam **organisasi aktif** dan meliputi item pada handover aktif maupun arsip yang masih dapat diakses, termasuk nama/afiliasi stakeholder atau vendor yang dicatat di item. Query kosong menampilkan daftar default, tanpa hasil memberi saran menghapus filter, dan karakter khusus tidak boleh mengubah cakupan otorisasi. Pencarian tidak mengindeks secret, token, kontak pribadi, atau isi halaman eksternal. Filter digabung dengan logika AND; status multi-pilih dalam satu filter memakai OR. Hasil selalu menunjukkan judul, kategori, posisi, status, handover/periode, dan waktu perubahan terakhir; bila relevan, tampilkan nama stakeholder/vendor dan ringkasan hubungan. Pagination atau pemuatan bertahap diperlukan untuk daftar panjang.

| Metrik | Definisi produk |
| --- | --- |
| Completion rate | `verified required aktif / seluruh required aktif × 100`; jika denominator 0, tampilkan “Belum ada item wajib”, bukan 100%. |
| Waiting review | Jumlah item `ready_for_review`. |
| Revision required | Jumlah item `revision_required`. |
| In progress | Jumlah item `in_progress`; `not_started` dilaporkan terpisah. |
| Overdue | Item wajib belum verified dengan target tanggal yang sudah lewat di zona waktu workspace. |
| Progress per posisi/kategori | Formula sama, dibatasi pada item wajib aktif dalam kelompok itu; denominator 0 ditandai kosong. |
| Outstanding optional | Item opsional belum verified; tidak memengaruhi completion rate. |

Dashboard harus menunjukkan numerator/denominator selain persentase. Setelah mutasi berhasil, angka harus mencerminkan keadaan tersimpan paling lambat saat halaman dimuat ulang. Jangan tampilkan grafik yang menyiratkan mutu organisasi dari metrik proses.

## 12. Indikator kerja dan notifikasi

MVP menampilkan **notifikasi di dalam aplikasi** untuk assignment baru kepada outgoing/incoming, `ready_for_review` kepada incoming, `revision_required` kepada outgoing, dan `verified` kepada outgoing serta incoming terkait. Tenggat mendekat (≤3 hari kalender) dan overdue memberi notifikasi kepada outgoing untuk item yang belum verified; satu jenis notifikasi tenggat tidak boleh berulang tak terbatas untuk item yang sama. Setiap notifikasi memiliki status belum/sudah dibaca, waktu, dan tautan ke item. Notifikasi yang timbul dari perubahan item dibuat hanya jika aksi bisnis berhasil. Menonaktifkan anggota atau mengganti assignment menghentikan notifikasi baru ke penerima lama; notifikasi historis tidak memberi akses ke item setelah haknya dicabut. Email/WhatsApp dan preference center belum termasuk MVP.

## 13. Activity log dan observabilitas produk

Setiap event audit minimum memuat organisasi, handover dan item bila relevan, aktor atau penanda sistem, jenis aksi, waktu, ringkasan yang dapat dibaca, dan alasan untuk override/reopen/reassignment. Catat perubahan status lama→baru dan keputusan review. Event tercipta sebagai bagian dari operasi yang sama dengan perubahan bisnis sehingga perubahan tidak sukses tanpa log atau sebaliknya. Member hanya membaca log organisasi sendiri; audit tidak dapat diedit/dihapus melalui UI. Jangan masukkan password, token, isi komentar sensitif, atau URL bertoken ke payload log. Admin dapat menelusuri log tetapi tidak memodifikasinya.

Analitik produk terpisah dari audit. Event agregat yang berguna: organisasi dibuat, handover active/completed, item submitted/verified/revision requested, pencarian tanpa hasil, dan kegagalan undangan. Jangan kirim isi item, kontak stakeholder, atau URL referensi ke analytics. Pelacakan disiapkan dengan persetujuan/konfigurasi privasi yang sesuai pilot.

## 14. Validasi dan keadaan antarmuka

- **Form:** field wajib diberi label, batas panjang dan contoh format; kesalahan ditampilkan dekat field dan ringkasan pada submit. Simpan draft tidak menuntut kelengkapan review. Tautan hanya `https://` atau skema aman yang disepakati; URL berisi kredensial/token ditolak atau diberi peringatan. Input teks diperlakukan sebagai teks, bukan HTML aktif.
- **Konflik:** perubahan bersamaan atau assignment yang dicabut saat form terbuka menghasilkan pesan konflik, tidak menimpa data orang lain; pengguna dapat memuat ulang dan menyalin masukan yang belum tersimpan.
- **Hak akses:** tanpa login diarahkan ke login; anggota organisasi lain menerima halaman akses ditolak atau 404 tanpa membocorkan identitas item; role tidak cukup mendapat penjelasan singkat dan tautan kembali.
- **Empty:** organisasi tanpa handover memberi CTA admin untuk setup dan pesan informatif bagi member; handover tanpa item menampilkan langkah admin; pencarian/filter kosong menunjukkan cara reset; tugas saya kosong menyatakan tidak ada tugas saat ini.
- **Loading:** skeleton atau status teks pada daftar/dashboard; tombol submit menampilkan proses dan mencegah pengiriman ganda; timeout memberi retry yang aman.
- **Error:** kegagalan menyimpan tidak mengubah UI menjadi sukses; form mempertahankan input; kegagalan referensi eksternal dijelaskan sebagai masalah pada tautan eksternal, bukan verifikasi otomatis.
- **Success:** perubahan status menampilkan konfirmasi, status terbaru, aktor, dan waktu. Aksi berisiko (hapus non-verified, nonaktifkan anggota, reopen) meminta konfirmasi dan alasan bila diwajibkan.

## 15. Aksesibilitas, responsivitas, dan arah visual

Target **WCAG 2.2 AA** untuk alur kritis: navigasi keyboard lengkap, fokus terlihat, label dan pesan error terhubung, status tidak dibedakan hanya oleh warna, kontras memadai, heading/logical reading order, nama tombol bermakna, dan pengumuman perubahan status untuk pembaca layar. Tabel kompleks memiliki alternatif kartu pada layar kecil. Target viewport minimum 320 px tanpa horizontal scroll pada alur inti; tablet dan desktop memanfaatkan ruang untuk filter dan ringkasan. Sentuhan memiliki target yang cukup besar, form dapat dipakai tanpa hover, dan reduced motion dihormati.

Bahasa visual mengikuti referensi Stripe-inspired yang diberikan: indigo primer `#533afd`, deep navy `#1c1e54`, kanvas putih/off-white (`#ffffff`, `#f6f9fc`), teks gelap, garis tipis, bayangan halus, tombol CTA pill, tipografi ringan dengan hirarki jelas. Gradient mesh terutama untuk landing/marketing; dashboard task-oriented, lebih padat dan tenang. Inspirasi visual tidak berarti memakai aset/merek Stripe atau font berlisensi tanpa hak; font produksi dipilih pada desain implementasi dengan keterbacaan setara. Komponen shadcn/ui dikustomisasi dengan token produk. Informasi, bukan ornamen, menjadi fokus layar kerja.

## 16. Keamanan, privasi, dan non-functional requirements

| Area | Kriteria MVP |
| --- | --- |
| Otorisasi | RLS pada seluruh data tenant dan pemeriksaan server untuk aksi; pengujian lintas organisasi, lintas role, direct URL, dan item reassignment wajib lulus. |
| Auth/session | Sesi aman berbasis Supabase Auth, logout mencabut akses di klien, protected routes memeriksa sesi, transport HTTPS. Secret server tidak terekspos di browser/repo. |
| Data minimization | Hanya kumpulkan identitas dan kontak yang diperlukan; larang password/recovery code; masking/penyaringan pada log dan analytics. |
| Retensi | Data handover dan audit dipertahankan selama organisasi aktif untuk fungsi arsip. Kebijakan penghapusan/ekspor organisasi harus diputuskan sebelum peluncuran publik; pilot menggunakan proses manual terdokumentasi. |
| Kinerja | Pada dataset pilot hingga 5.000 item per organisasi, p95 dashboard interaktif ≤3 detik dan p95 hasil pencarian ≤2 detik pada koneksi broadband wajar; ukur dari pengguna pilot, kecualikan layanan eksternal. |
| Keandalan | Mutasi bisnis dan audit konsisten; submit berulang tidak membuat duplikasi item/keputusan; operasi gagal dapat dicoba kembali. Backup dan pemulihan Supabase sesuai paket yang dipilih diverifikasi sebelum pilot. |
| Kompatibilitas | Dua versi utama terbaru browser Chrome, Safari, Firefox, Edge pada desktop/mobile yang didukung; alur utama berfungsi tanpa instalasi aplikasi. |
| Operasional | Error penting dapat ditelusuri tanpa menyimpan isi sensitif; ada pemilik untuk incident, pemulihan akses admin, dan perubahan konfigurasi deployment. |

Target kinerja adalah acceptance target produk, bukan janji SLA vendor. Batas upload tidak relevan untuk MVP karena referensi menggunakan URL.

## 17. Acceptance criteria end-to-end

MVP siap pilot jika seluruh skenario berikut lulus dengan data realistis.

1. Admin baru membuat organisasi, dua periode berbeda, posisi, mengundang dua anggota, menugaskan outgoing/incoming berbeda, membuat handover dan satu item wajib, lalu mengaktifkannya.
2. Outgoing menyimpan draft parsial, melengkapinya, lalu mengirim untuk review. Hanya outgoing assigned yang dapat mengubah dan submit item tersebut.
3. Incoming assigned melihat item di Tugas Saya, meminta revisi dengan alasan, outgoing memperbaiki dan mengirim ulang, lalu incoming memverifikasi. Alur status dan komentar tampil kronologis.
4. Outgoing yang juga admin atau incoming pada konteks lain tidak dapat memverifikasi item yang ia serahkan; incoming assigned atau admin organisasi yang bukan penyerah dapat review. Keputusan admin tampil dan diaudit sebagai tindakan admin; anggota lain ditolak lewat UI maupun permintaan langsung.
5. Completion berubah dari `0/1` ke `1/1` hanya setelah verified. Handover tidak dapat ditutup saat item wajib belum verified dan dapat ditutup setelahnya. Item opsional belum selesai tidak memblokir penutupan, namun terlihat.
6. Organisasi B tidak dapat melihat, mencari, menghitung, membuka URL, mengubah, atau membaca activity log organisasi A. Akun multiorganisasi melihat data yang benar setelah berpindah workspace.
7. Perubahan status, penggantian reviewer, reopen, penonaktifan item, dan penutupan memiliki aktor/waktu/alasan sesuai aturan, dan tidak ada audit event palsu setelah aksi gagal.
8. Pencarian menemukan item berdasarkan judul/posisi maupun nama stakeholder/vendor dalam organisasi aktif, filter gabungan benar, dan hasil kosong memiliki reset yang jelas.
9. Alur setup, edit, review, dan dashboard dapat diselesaikan dengan keyboard serta pada viewport 320 px tanpa kehilangan aksi penting.
10. Submit ganda, jaringan terputus, sesi kedaluwarsa, dan perubahan bersamaan tidak menimbulkan status ganda atau keberhasilan palsu.
11. Admin dapat membuat template checklist, memakainya untuk handover baru, dan mengubah template tanpa mengubah item handover yang sudah dibuat.
12. Kelima peristiwa notifikasi BRD muncul di aplikasi hanya untuk penerima sah; status baca tersimpan dan tautan historis tetap mengikuti izin terkini.

## 18. Edge cases yang wajib dirancang

| Kasus | Perilaku yang diharapkan |
| --- | --- |
| Satu orang menjabat outgoing dan calon incoming untuk posisi sama | Admin harus menunjuk reviewer lain sebelum item bisa dikirim; tidak ada self-verification. |
| Incoming belum menerima undangan | Item boleh disiapkan sebagai draft; submit tertahan sampai reviewer aktif. |
| Reviewer dinonaktifkan atau diganti saat review | Item kembali `in_progress`, tugas dipindah setelah assignment sah, alasan diaudit. |
| Item wajib berubah menjadi opsional atau dinonaktifkan | Hanya admin, dengan alasan; denominator berubah dan audit menjelaskan perubahan. |
| Handover tanpa item wajib | Tidak dapat active/completed; dashboard menampilkan empty state, bukan 100%. |
| Dua incoming mencoba review serentak | Keputusan pertama tersimpan; aksi kedua menerima konflik dengan status terbaru. |
| Referensi dokumen hilang/izin eksternal dicabut | Incoming meminta revisi; aplikasi tidak menganggap URL valid sebagai bukti akses. |
| Item verified perlu koreksi | Admin reopen dengan alasan; progres turun dan reviewer menilai ulang. |
| Admin terakhir hendak keluar | Ditolak sampai admin pengganti aktif. |
| Dua handover untuk pasangan periode sama | Handover kedua boleh disiapkan sebagai draft, tetapi hanya satu yang dapat `active` pada satu waktu; aktivasi kedua ditolak sampai yang pertama `completed`. |

## 19. Ketergantungan dan rencana peluncuran

**Ketergantungan:** akun pemilik GitHub, Supabase, Vercel; domain bila dipakai; keputusan pemilik organisasi pilot; daftar periode/posisi/member nyata; checklist awal; kebijakan kontak stakeholder; cara aman mentransfer kredensial di luar aplikasi; kapasitas dan backup paket Supabase; pemilik support pilot. Repository GitHub `maliknaharmn/handover` tersedia; detail layanan pengembangan dicatat di `SETUP.md`.

**Pilot satu organisasi:**

1. Pilih organisasi dan satu transisi nyata; tetapkan admin penanggung jawab serta reviewer keamanan/data.
2. Siapkan data minimal dua periode, 3–5 posisi, 2–3 anggota per role, dan 20–50 item campuran termasuk akun, dokumen, program, stakeholder, tugas.
3. Jalankan UAT dengan admin, outgoing, incoming; uji kasus revisi, self-verification, lintas organisasi kedua sebagai tenant uji, mobile, dan pemulihan error.
4. Perbaiki semua defect P0; dokumentasikan defect P1 beserta workaround. Pastikan backup, pemilik akun, dan kanal dukungan tersedia.
5. Luncurkan pilot terbatas, pantau mingguan, evaluasi setelah satu siklus transisi. Publikasi lebih luas memerlukan keputusan retensi, penghapusan, serta keamanan operasional.

**Go/no-go pilot:** seluruh acceptance criteria lulus, tidak ada kebocoran lintas organisasi, tidak ada jalur self-verification, data pilot tervalidasi admin, dan pemilik operasional dapat menangani akses serta insiden dasar.

## 20. Ukuran keberhasilan

| Metrik | Rumus / sumber | Sasaran pilot awal |
| --- | --- | --- |
| Handover completion rate | Item wajib verified / item wajib aktif | ≥90% pada tanggal penutupan pilot; target bukan pengganti syarat completed 100%. |
| Verification rate | Item submitted yang akhirnya verified / item submitted unik | ≥80% dalam 14 hari setelah submit. |
| Median review time | Waktu `ready_for_review` pertama/terakhir sampai keputusan reviewer | ≤3 hari kalender untuk pilot; lihat distribusi, bukan hanya median. |
| Revision rate | Item yang pernah `revision_required` / item submitted | Baseline observasi; tidak ada target normatif. |
| Missing asset count | Item wajib Accounts/Documents yang belum dapat diverifikasi karena aset tidak tersedia | 0 saat penutupan; alasan dicatat pada item. |
| Adoption | Posisi dengan minimal satu item verified / posisi yang berpartisipasi | 100% posisi pilot. |
| Transition completion time | Tanggal active sampai completed | Baseline untuk siklus berikutnya. |

Admin pilot meninjau angka mingguan bersama pengguna. Sampel kecil tidak dipakai untuk klaim dampak kausal; wawancara singkat memeriksa apakah informasi mudah ditemukan dan review benar-benar membantu.

## 21. Risiko, pertanyaan terbuka, dan roadmap

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Pengguna memasukkan kredensial ke catatan | Kebocoran aset | Panduan jelas, larangan, validasi pola umum, review manual pilot, minimalkan log. |
| RLS atau assignment keliru | Kebocoran/aksi tidak sah | Matriks izin turunan PRD, uji adversarial lintas tenant dan role sebelum pilot. |
| Checklist terlalu besar atau kabur | Pengguna tidak menyelesaikan handover | Template awal kecil, item wajib dipilih admin, ukur revision/abandonment. |
| Referensi eksternal mati | Verifikasi semu | Reviewer wajib membuka dan menguji akses; gunakan revision flow. |
| Admin tunggal hilang akses | Organisasi terhenti | Minimal dua admin aktif saat pilot bila mungkin; prosedur recovery terdokumentasi. |
| Progres dimanipulasi melalui perubahan required | Angka menyesatkan | Alasan dan audit untuk perubahan flag; tampilkan perubahan pada aktivitas. |

**Keputusan produk yang dikunci pada 29 September 2026:**

1. Pilot hanya untuk KODISIA; model dan RLS tetap memisahkan organisasi untuk pengembangan berikutnya.
2. Anggota bergabung melalui undangan admin. Pendaftaran publik dan pembuatan organisasi mandiri tidak ada di MVP.
3. Hanya satu handover aktif per pasangan periode dalam organisasi.
4. Admin dapat memverifikasi atau meminta revisi sebagai pengganti incoming bila bukan penyerah item; tindakan admin dicatat.
5. Kontak stakeholder yang layak dibagikan terlihat oleh semua anggota KODISIA yang aktif.

**Keputusan operasional sebelum pilot:** tentukan penanggung jawab permintaan ekspor/penghapusan data serta format label periode yang dipakai KODISIA. Baseline periode adalah label fleksibel dengan tanggal mulai/akhir opsional, zona waktu Asia/Jakarta.

**Roadmap:**

| Fase | Keluaran dan gerbang |
| --- | --- |
| 0. Product baseline | PRD disetujui; open questions yang memengaruhi schema/izin ditutup. |
| 1. Technical design | Model data, state machine, matriks RLS, route map, audit strategy, threat review, test plan. |
| 2. Setup & foundation | Repository GitHub, Next.js UI foundation, Supabase Auth, organisasi/member, deployment Vercel nonproduksi; uji isolasi awal. |
| 3. Core workflow | Periode/posisi/handover, checklist, item, review/revision, audit atomik. |
| 4. Visibility & quality | Dashboard, tugas saya, pencarian/filter stakeholder, notifikasi in-app, states, responsivitas, aksesibilitas, security/e2e tests. |
| 5. Pilot | Data nyata, UAT, perbaikan P0, backup/recovery, deploy terbatas, evaluasi metrik. |
| 6. Pasca pilot | Putuskan P1 berdasarkan perilaku nyata: template lintas organisasi/versioning, pengingat lebih kaya, upload, ekspor, integrasi. |

## 22. Referensi dan precedence

Dokumen ini diselaraskan dengan BRD Handover v1.0 yang baru dilampirkan pengguna, file referensi visual `stripe-DESIGN.md` dan `taste-SKILL.md`, serta permintaan terbaru yang secara eksplisit mengunci Next.js. Kalimat penutup pada berkas BRD yang pernah meminta framework lain adalah bagian dari konteks lama dan telah digantikan keputusan stack terbaru. BRD menyebut Verification sebagai konsep data; PRD ini mempertahankan perilakunya melalui status/metadata dan audit item, sementara bentuk tabel diputuskan saat technical design. Perubahan requirement setelah baseline harus dicatat dengan tanggal, alasan, dampak acceptance criteria, dan persetujuan product owner sebelum technical design/implementasi terkait diubah.
