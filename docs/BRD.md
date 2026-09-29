# Business Requirements Document Handover

**Organizational Knowledge and Leadership Transition System**

- **Versi:** 1.2
- **Tanggal:** 29 September 2026
- **Status:** Draft untuk review user dan project manager
- **Pemilik keputusan:** Product owner
**Target awal:** KODISIA sebagai pilot pertama; fondasi data mendukung organisasi lain kelak

## 1. Ringkasan eksekutif

Handover adalah aplikasi web untuk mengelola serah terima kepengurusan secara terstruktur. Aplikasi ini membantu pengurus lama mencatat pengetahuan, aset, dokumen, relasi, dan pekerjaan yang belum selesai; pengurus baru memeriksa dan memverifikasi penerimaannya; admin memantau penyelesaian transisi. Handover menjadi pusat kendali proses, bukan tempat menyimpan password atau menggantikan penyimpanan dokumen eksternal.

Untuk MVP, produk ini difokuskan pada **transfer pengetahuan organisasi KODISIA**. Keanggotaan pilot melalui undangan admin; data tetap dipisahkan per organisasi agar fondasinya dapat dipakai lebih luas nanti.

**Keputusan bisnis MVP:** satu organisasi pilot harus dapat menyelesaikan satu transisi antardua periode dari persiapan hingga penutupan. Ukuran selesai adalah seluruh **item wajib terverifikasi** oleh penerima yang berwenang. Riwayat perubahan harus dapat ditelusuri dan data antarorganisasi harus terpisah. Dokumen ini menjelaskan kebutuhan bisnis; rincian perilaku layar dan acceptance test terdapat di `PRD.md`.

## 2. Masalah dan peluang

Pergantian pengurus sering menghilangkan konteks organisasi. Dokumen dan SOP tersebar, akun digital masih dikuasai pengurus lama, informasi stakeholder tersimpan secara pribadi, hasil program tidak terdokumentasi, dan pekerjaan terbuka tidak memiliki penerus jelas. Checklist informal tidak membuktikan bahwa penerima sudah memperoleh dan memahami aset. Akibatnya, pengurus baru mengulang pekerjaan, menunggu jawaban dari pengurus sebelumnya, dan tidak mengetahui tingkat kesiapan transisi.

Handover memberi satu daftar tanggung jawab yang dapat ditinjau dan diverifikasi. Organisasi memperoleh catatan historis yang tetap dapat dipakai pada periode berikutnya. Nilai utamanya adalah **kontinuitas kerja dan akuntabilitas transisi**, bukan penilaian performa individu.

## 3. Tujuan bisnis dan ukuran hasil

| ID | Tujuan bisnis | Cara mengetahui hasilnya |
| --- | --- | --- |
| BO-01 | Membuat proses transisi konsisten antarposisi dan periode | Semua posisi pilot memiliki checklist, penyerah, dan penerima yang jelas. |
| BO-02 | Mengurangi kehilangan informasi dan aset | Item wajib yang hilang atau belum dapat ditransfer terlihat serta dapat ditindaklanjuti. |
| BO-03 | Membedakan penyerahan dari penerimaan | Item baru selesai setelah diverifikasi; revisi memiliki alasan. |
| BO-04 | Memberi admin visibilitas untuk menindaklanjuti hambatan | Dashboard menampilkan progres dan item yang tertahan menurut posisi/kategori. |
| BO-05 | Menjaga memori organisasi | Item dan riwayat handover terdahulu tetap dapat dicari oleh anggota yang berhak. |
| BO-06 | Melindungi data setiap organisasi | Pengguna organisasi lain tidak dapat melihat atau mengubah data di luar keanggotaannya. |

### Metrik pilot

| Metrik | Definisi | Sasaran atau cara pakai |
| --- | --- | --- |
| Completion rate | Jumlah item wajib terverifikasi ÷ jumlah item wajib aktif | 100% untuk menutup handover; pantau mingguan. |
| Verification rate | Item yang akhirnya terverifikasi ÷ item unik yang pernah dikirim untuk review | Sasaran awal ≥80% dalam 14 hari sejak submit; dievaluasi berdasarkan data pilot. |
| Review time | Lama dari siap direview sampai keputusan penerima | Median awal ≤3 hari kalender; pantau item yang jauh lebih lambat. |
| Missing asset count | Aset wajib yang tidak tersedia atau belum berhasil ditransfer | Ditargetkan 0 saat penutupan, atau ditangani melalui keputusan bisnis yang tercatat sebelum item diverifikasi. |
| Adoption | Posisi yang memakai sistem dan menyelesaikan minimal satu item ÷ posisi pilot | 100% posisi pilot. |
| Transition completion time | Waktu dari handover aktif hingga ditutup | Menjadi baseline untuk siklus berikutnya. |

Persentase completion mengukur kelengkapan proses di aplikasi, bukan mutu organisasi atau kinerja pengurus. Angka sasaran pilot adalah hipotesis awal untuk dievaluasi, bukan klaim hasil.

## 4. Pengguna dan tanggung jawab

| Peran | Tanggung jawab utama | Keputusan yang dapat diambil |
| --- | --- | --- |
| Admin organisasi | Menyiapkan workspace, periode, struktur, anggota, assignment, checklist, dan memantau handover | Membuka/menutup handover; mengelola aturan kerja; dapat membantu review bila bukan penyerah item. |
| Outgoing officer | Menyerahkan pengetahuan, referensi, status aset, serta pekerjaan tertunda pada item yang ditugaskan | Menyimpan draft, mengirim untuk review, menanggapi permintaan revisi. |
| Incoming officer | Memeriksa kelengkapan dan akses terhadap item yang diterima | Memverifikasi atau meminta revisi dengan alasan. |

Peran berlaku per organisasi. Satu orang dapat menjadi anggota beberapa organisasi atau memegang lebih dari satu peran, tetapi **tidak boleh memverifikasi item yang ia serahkan sendiri**. Penugasan posisi dan item menentukan pekerjaan spesifik setiap orang. Admin melihat keseluruhan organisasi, sedangkan hak edit dan review tetap mengikuti aturan ini.

## 5. Proses bisnis target

1. Admin membuat organisasi dan menyiapkan periode asal serta tujuan.
2. Admin menetapkan posisi/divisi, anggota, dan pasangan outgoing–incoming untuk transisi.
3. Admin membuat checklist berdasarkan kategori, dapat memakai template organisasi, menandai item wajib/opsional, lalu mengaktifkan handover.
4. Outgoing mengisi item dan referensi, menyimpan draft bila belum lengkap, kemudian mengirim item siap direview.
5. Incoming atau admin yang sah memeriksa item. Mereka dapat memverifikasi atau meminta revisi dengan alasan. Outgoing memperbaiki dan mengirim ulang sampai diterima.
6. Dashboard menghitung ulang progres dari item wajib yang terverifikasi. Aktivitas penting tercatat dengan pelaku dan waktu.
7. Admin menutup handover setelah semua item wajib terverifikasi. Riwayat tetap dapat dibaca oleh anggota organisasi yang berhak.

**Alur status item:** `Not Started → In Progress → Ready for Review → Verified`. Jika perlu perbaikan: `Ready for Review → Revision Required → In Progress → Ready for Review`. Tahap `In Progress` pada revisi memungkinkan outgoing menyimpan perbaikan sebagai draft sebelum mengirim ulang.

Status handover secara keseluruhan adalah `Draft → Active → Completed`. **Status pekerjaan** pada kategori Outstanding Tasks dan **status transfer aset** pada Accounts/Documents adalah informasi bisnis di dalam item; keduanya tidak sama dengan status review item. Pekerjaan yang sudah selesai atau aset yang ditandai telah ditransfer tetap memerlukan verifikasi incoming/admin yang sah agar item handover menjadi `Verified`.

## 6. Kebutuhan bisnis MVP

### Identitas dan ruang kerja

| ID | Kebutuhan bisnis | Prioritas |
| --- | --- | --- |
| BRQ-01 | Anggota KODISIA bergabung melalui undangan admin, lalu dapat masuk, keluar, dan memulihkan akses. Tidak ada pendaftaran publik pada pilot. Akses hanya diberikan pada organisasi tempat ia menjadi anggota aktif. | Wajib |
| BRQ-02 | Admin dapat membuat workspace berisi nama dan logo opsional organisasi, periode, anggota, struktur, serta data handover. Satu akun dapat memilih workspace jika bergabung di lebih dari satu organisasi. | Wajib |
| BRQ-03 | Admin dapat menambah anggota, menetapkan/mengubah peran, dan menonaktifkan akses. Organisasi harus selalu memiliki setidaknya satu admin aktif. | Wajib |

### Struktur dan checklist

| ID | Kebutuhan bisnis | Prioritas |
| --- | --- | --- |
| BRQ-04 | Admin dapat membuat periode dan struktur posisi/divisi serta menetapkan siapa menjabat pada periode asal dan tujuan. | Wajib |
| BRQ-05 | Admin dapat membuka proses handover antara dua periode dalam organisasi yang sama dan menghubungkan outgoing serta incoming per posisi. Hanya satu handover boleh aktif untuk pasangan periode yang sama. | Wajib |
| BRQ-06 | Admin dapat membuat kategori dan checklist, menandai item wajib/opsional, menentukan penanggung jawab, serta tanggal target bila diperlukan. | Wajib |
| BRQ-07 | Admin dapat membuat dan memakai ulang template checklist sederhana di organisasinya. Mengubah template tidak mengubah handover yang sudah berjalan. | Wajib |

### Serah terima dan verifikasi

| ID | Kebutuhan bisnis | Prioritas |
| --- | --- | --- |
| BRQ-08 | Outgoing dapat menyimpan catatan, referensi tautan, rincian aset/pekerjaan, dan draft pada item yang ditugaskan. | Wajib |
| BRQ-09 | Outgoing dapat mengirim item untuk review bila informasi minimum dan penerima yang sah sudah tersedia. Item tidak dianggap selesai saat dikirim. | Wajib |
| BRQ-10 | Incoming yang ditugaskan dapat menerima/verifikasi atau meminta revisi. Admin organisasi juga dapat melakukan review jika bukan penyerah item; tindakan admin dibedakan dalam riwayat. Permintaan revisi harus menyebut alasan. | Wajib |
| BRQ-11 | Outgoing dapat memperbaiki item dan mengirim ulang. Item yang sudah diverifikasi hanya dapat dibuka kembali oleh admin dengan alasan yang tercatat. | Wajib |
| BRQ-12 | Pengguna terkait dapat memberi komentar pada item; komentar biasa tidak otomatis mengubah status. | Wajib |

### Visibilitas dan memori organisasi

| ID | Kebutuhan bisnis | Prioritas |
| --- | --- | --- |
| BRQ-13 | Dashboard menampilkan progres total serta menurut posisi dan kategori, jumlah verified, menunggu review, revisi, belum dimulai, sedang dikerjakan, dan item lewat tenggat. | Wajib |
| BRQ-14 | Pengguna dapat mencari informasi dalam organisasi yang aktif, termasuk item, dokumen yang direferensikan, nama stakeholder/vendor, dan posisi. Hasil pencarian dibatasi oleh hak akses. | Wajib |
| BRQ-15 | Sistem memberi notifikasi **di dalam aplikasi** saat item ditugaskan, siap direview, diminta revisi, diverifikasi, atau mendekati tenggat. Penerima dapat melihat daftar dan status baca notifikasinya. | Wajib |
| BRQ-16 | Perubahan penting, terutama status, penugasan, dan keputusan review, tercatat dalam activity log yang dapat ditelusuri anggota organisasi. | Wajib |
| BRQ-17 | Setelah handover ditutup, anggota yang berhak tetap dapat membaca item dan riwayat sebagai pengetahuan organisasi. | Wajib |

### Isi minimum per kategori

| Kategori | Informasi yang perlu dapat dicatat |
| --- | --- |
| Accounts and Digital Assets | Jenis/nama akun atau aset, pemilik saat ini, status transfer, langkah atau referensi kanal transfer aman; tanpa password atau recovery code. Contoh: media sosial, email, domain, hosting, repository, Canva. |
| Documents | Nama, deskripsi, versi/tahun, pemilik, status transfer, dan tautan. Contoh: AD/ART, SOP, LPJ, proposal, template surat. |
| Programs and Responsibilities | Nama, tujuan, jadwal, SOP/referensi, hasil/evaluasi periode lama, dan rekomendasi periode baru. |
| Stakeholders | Nama, organisasi/afiliasi, peran, kontak yang layak dibagikan, hubungan, dan catatan komunikasi yang diperlukan. |
| Outstanding Tasks | Pekerjaan, penanggung jawab, tenggat, prioritas, catatan, dan status pekerjaan. |

Informasi minimum untuk **mengirim** item ditetapkan per kategori di PRD. Outgoing tetap boleh menyimpan draft parsial. Rincian yang tidak relevan bagi suatu item tidak boleh dipaksakan hanya untuk memenuhi form.

## 7. Aturan bisnis utama

| ID | Aturan |
| --- | --- |
| RULE-01 | Setiap handover memiliki satu periode asal dan satu periode tujuan yang berbeda dalam organisasi yang sama. |
| RULE-02 | Item wajib memiliki penanggung jawab outgoing dan penerima incoming yang berbeda sebelum proses handover aktif. |
| RULE-03 | Outgoing tidak dapat memverifikasi item yang ia serahkan, termasuk jika ia juga admin. |
| RULE-04 | Hanya incoming yang ditugaskan atau admin organisasi yang bukan penyerah dapat memverifikasi atau meminta revisi. |
| RULE-05 | Handover hanya dapat ditutup bila ada minimal satu item wajib dan semua item wajib aktif terverifikasi. Item opsional yang belum selesai tetap terlihat, tetapi tidak menghalangi penutupan. |
| RULE-06 | Setiap perubahan status dan tindakan administratif yang memengaruhi progres memiliki jejak pelaku, waktu, dan alasan bila relevan. |
| RULE-07 | Anggota tidak dapat membaca atau mengubah data organisasi lain, termasuk melalui pencarian, tautan langsung, atau permintaan aplikasi. |
| RULE-08 | Password, token, dan recovery code tidak boleh disimpan pada item, komentar, notifikasi, atau log. Referensi menuju metode transfer aman diperbolehkan. |
| RULE-09 | Mengubah item wajib menjadi opsional, mengganti reviewer, menonaktifkan item, atau membuka kembali item verified memerlukan alasan dan audit. |
| RULE-10 | Hanya satu handover boleh aktif untuk pasangan periode asal dan tujuan yang sama dalam organisasi. |

**Rumus progres:** `jumlah item wajib aktif berstatus Verified ÷ seluruh item wajib aktif × 100%`. Jika belum ada item wajib, tampilkan kondisi kosong, bukan 100%. Item yang baru `Ready for Review` belum menambah progres. Tanggal tenggat dan item overdue tetap terlihat agar admin dapat menindaklanjuti hambatan.

## 8. Cakupan, batas, dan asumsi MVP

**Termasuk MVP:** autentikasi, workspace organisasi, periode dan posisi, anggota dan peran, penugasan outgoing/incoming, handover, kategori, template checklist sederhana, item dan referensi tautan, catatan/komentar, status dan verifikasi, dashboard, pencarian, notifikasi in-app, activity log, serta kontrol akses antarorganisasi.

**Belum termasuk MVP:** AI summary, email/WhatsApp otomatis, integrasi Google Drive, penyimpanan password, upload/migrasi dokumen native, tanda tangan digital, aplikasi mobile native, analitik kompleks, profil organisasi publik, chat, blockchain, dan workflow persetujuan bertingkat. Kebutuhan berkas dipenuhi melalui tautan ke layanan penyimpanan yang sudah dipakai organisasi.

**Asumsi pilot:** KODISIA menjalankan satu transisi nyata; organisasi dan anggota baru dibuat melalui jalur admin; kontak stakeholder yang dicatat layak dibagikan kepada semua anggota KODISIA yang aktif; satu item memiliki satu incoming utama. Kebijakan ekspor/penghapusan data dan format label periode harus ditetapkan sebelum pilot.

## 9. Kualitas layanan, keamanan, dan pengalaman pengguna

| Area | Kebutuhan bisnis |
| --- | --- |
| Keamanan dan privasi | Pengguna harus login untuk data internal; akses mengikuti organisasi/peran/assignment; seluruh trafik terenkripsi; data pribadi diminimalkan; rahasia akun tidak disimpan. |
| Keandalan | Perubahan penting tersimpan bersama identitas pelaku dan waktu; kegagalan tidak boleh tampak sebagai keberhasilan atau menghasilkan status ganda. |
| Kinerja | Target awal dashboard interaktif ≤3 detik dan hasil pencarian ≤2 detik pada dataset pilot normal serta koneksi broadband wajar. |
| Kegunaan | Alur inti dapat dipakai di desktop dan ponsel tanpa pelatihan teknis khusus; form memiliki validasi, pesan error, loading, dan kondisi kosong yang jelas. |
| Aksesibilitas | Alur kritis dapat dipakai dengan keyboard dan pembaca layar; status tidak hanya dibedakan lewat warna; target WCAG 2.2 AA. |
| Desain | Indigo `#533afd`, deep navy, permukaan putih/off-white, CTA pill, tipografi ringan, garis/bayangan halus. Gradient mesh dipakai terutama pada halaman marketing; dashboard fokus pada tugas dan data. |
| Operasional | Pemilik akun layanan, backup/pemulihan, dan penanganan insiden ditetapkan sebelum pilot. |

Stack resmi untuk delivery adalah **Next.js, TypeScript, Tailwind CSS, shadcn/ui, Supabase Auth/PostgreSQL/RLS, Vercel, dan GitHub**. Pilihan ini merupakan keputusan project terbaru; detail arsitektur, skema, dan deployment akan dirumuskan pada technical design. Responsivitas antarmuka menjadi requirement desain dan pengujian, bukan sifat otomatis dari framework.

## 10. Kriteria penerimaan bisnis

MVP dapat masuk pilot ketika project manager dan perwakilan organisasi menyaksikan skenario berikut berhasil:

1. Admin membuat organisasi, periode, posisi, anggota, assignment, checklist, dan handover aktif.
2. Outgoing mengisi item, mengirim untuk review; incoming meminta revisi dengan alasan; outgoing memperbaiki dan mengirim ulang; incoming memverifikasi.
3. Admin yang bukan penyerah dapat membantu review, tetapi tidak ada cara bagi penyerah untuk memverifikasi itemnya sendiri.
4. Progres hanya bertambah setelah item wajib verified, dan handover hanya dapat ditutup setelah seluruh item wajib verified.
5. Dashboard menampilkan keadaan yang sama dengan daftar item; anggota dapat mencari dan membaca riwayat organisasi sesuai haknya.
6. Notifikasi in-app muncul kepada pihak yang tepat untuk lima peristiwa MVP dan tidak memberikan akses yang sudah dicabut.
7. Perubahan penting memiliki activity log yang menjelaskan siapa, apa, dan kapan.
8. Akun organisasi lain gagal membaca atau mengubah seluruh data, termasuk lewat URL langsung dan pencarian.
9. Alur inti dapat digunakan pada ponsel dan keyboard; kegagalan jaringan atau aksi bersamaan tidak menghasilkan keberhasilan palsu.

Uji terinci per layar, data, dan role mengikuti `PRD.md` dan rencana QA. Kriteria bisnis ini tidak menggantikan pengujian keamanan teknis.

## 11. Ketergantungan, peluncuran, dan pengambilan keputusan

Sebelum pilot, project manager memastikan organisasi pilot, admin penanggung jawab, daftar periode dan posisi, calon anggota, checklist awal, serta metode aman transfer kredensial tersedia. Tim delivery memastikan akun pemilik GitHub, Supabase, dan Vercel, deployment, backup, dan prosedur pemulihan tercatat. Repository GitHub `maliknaharmn/handover` sudah tersedia; integrasi deployment tetap diverifikasi pada tahap setup.

**Rencana pilot:** siapkan satu organisasi dan satu transisi nyata; masukkan 20–50 item dari lima kategori; lakukan UAT dengan admin, outgoing, dan incoming; uji revisi, konflik, mobile, serta isolasi tenant kedua; selesaikan seluruh masalah kritis; luncurkan terbatas; tinjau metrik dan wawancara pengguna tiap minggu. Handover dinyatakan selesai hanya sesuai RULE-05.

**Gerbang go/no-go:** semua kriteria penerimaan bisnis lulus, tidak ada kebocoran lintas organisasi atau self-verification, data awal disetujui admin pilot, dan pemilik operasional tahu cara menangani akses serta insiden dasar.

## 12. Risiko utama

| Risiko | Dampak | Tindakan pencegahan |
| --- | --- | --- |
| Pengguna memasukkan password atau token ke catatan | Kebocoran aset digital | Larangan jelas di UI, pemeriksaan pola umum, panduan transfer melalui kanal aman. |
| Hak akses salah | Data organisasi bocor atau keputusan review tidak sah | Uji role, assignment, dan isolasi lintas organisasi sebelum pilot. |
| Checklist terlalu panjang atau kabur | Handover tertunda dan pengguna meninggalkan proses | Mulai dari template ringkas, pilih item wajib secara sadar, evaluasi pilot. |
| Tautan eksternal tidak dapat dibuka | Item tampak lengkap tetapi penerima tidak memperoleh aset | Incoming menguji akses sebelum verify; gunakan revisi bila gagal. |
| Admin tunggal kehilangan akses | Workspace tidak dapat dikelola | Usahakan dua admin aktif dan dokumentasikan pemulihan. |
| Perubahan status wajib/opsional mengubah persentase | Progres menjadi menyesatkan | Perubahan memerlukan alasan dan tampil di activity log. |

## 13. Keputusan produk dan tindak lanjut

**Sudah diputuskan pada 29 September 2026:** KODISIA adalah pilot pertama dengan fondasi multi-organisasi; anggota masuk melalui undangan admin; satu handover aktif per pasangan periode; admin boleh membantu review bila bukan penyerah dan tindakannya diaudit; kontak stakeholder yang layak dicatat terlihat oleh semua anggota KODISIA yang aktif.

**Masih perlu diputuskan sebelum pilot:**

| ID | Pertanyaan | Baseline sementara | Batas keputusan |
| --- | --- | --- | --- |
| D-04 | Siapa menyetujui permintaan ekspor/penghapusan data organisasi? | Proses manual melalui admin dan pemilik operasional pilot. | Product owner bersama admin pilot, sebelum pilot. |
| D-05 | Format periode dan zona waktu organisasi pilot? | Label periode fleksibel; zona waktu awal Asia/Jakarta. | Admin pilot bersama PM, sebelum setup pilot. |

Keputusan terbuka tidak menunda penulisan technical design secara keseluruhan, tetapi implementasi bagian terkait harus mengikuti keputusan yang dicatat. Product owner menyetujui perubahan lingkup; project manager mencatat dampaknya pada jadwal dan sumber daya.

## 14. Roadmap dan hubungan dokumen

| Fase | Keluaran |
| --- | --- |
| 0. Persetujuan kebutuhan | Review BRD, tutup keputusan terbuka yang memengaruhi rancangan, tetapkan organisasi pilot. |
| 1. Technical design | Model data, matriks izin/RLS, alur status, rute, audit, keamanan, dan rencana pengujian. |
| 2. Foundation | Repository, deployment nonproduksi, auth, organisasi, anggota, periode, dan posisi. |
| 3. Core handover | Assignment, template/checklist, item, review/revisi, dan activity log. |
| 4. Visibility and quality | Dashboard, pencarian, notifikasi in-app, mobile, aksesibilitas, dan QA. |
| 5. Pilot | UAT, perbaikan masalah kritis, rilis terbatas, evaluasi metrik. |
| 6. Setelah pilot | Prioritaskan upload, ekspor, pengingat lebih kaya, atau integrasi berdasarkan temuan. |

**Hierarki dokumen:** BRD ini menjelaskan tujuan, lingkup, dan aturan bisnis untuk user serta project manager. `PRD.md` menjabarkan perilaku produk dan acceptance criteria secara lebih rinci. Technical design berikutnya menerjemahkan keduanya ke arsitektur dan implementasi. Jika ada perubahan kebutuhan bisnis, perbarui BRD dan dampaknya pada PRD sebelum membangun bagian terkait.

**Riwayat versi:** v1.2 mengunci keputusan pilot KODISIA, undangan admin, satu handover aktif per pasangan periode, hak review admin, dan visibilitas kontak stakeholder. V1.1 menyelaraskan stack Next.js, template checklist, notifikasi in-app, pencarian stakeholder/vendor, serta alur revisi yang menyimpan draft.
