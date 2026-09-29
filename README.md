# Handover KODISIA

Handover adalah project web app internal untuk **transfer pengetahuan organisasi KODISIA** saat pergantian kepengurusan. Tujuannya agar pengurus baru dapat menemukan dan menerima konteks kerja, aset, serta tanggung jawab dari periode sebelumnya tanpa bergantung pada ingatan pengurus lama.

## Alur utama

1. Admin menyiapkan periode kepengurusan, posisi, anggota, dan checklist serah terima.
2. Pengurus lama (*outgoing*) mencatat informasi dan referensi yang perlu diserahkan.
3. Pengurus baru (*incoming*) meninjau setiap item, memverifikasi penerimaan, atau meminta revisi.
4. Dashboard menampilkan progres berdasarkan item wajib yang telah terverifikasi; activity log menyimpan riwayat perubahan.

Pengetahuan yang dicakup meliputi akun dan aset digital, dokumen dan SOP, program kerja, relasi stakeholder, serta pekerjaan yang belum selesai. Handover mencatat status dan rujukan transfer akun, **bukan password atau recovery code**.

## Rencana teknologi

Next.js, TypeScript, Tailwind CSS, shadcn/ui, Supabase Auth dan PostgreSQL dengan Row Level Security, Vercel, serta GitHub. Data setiap organisasi harus terisolasi.

**Status:** tahap perencanaan MVP; pengembangan aplikasi belum dimulai.
