# Inventaris Isi Website JagoFarm

Terakhir diperbarui: 2 September 2026  
Sumber implementasi: `src/main.jsx`

Dokumen ini mencatat isi yang saat ini tampil pada setiap halaman website JagoFarm. Section **Pilot** tidak digunakan.

## Elemen Global

Elemen berikut tampil pada seluruh halaman:

- Navbar: logo JagoFarm, Tentang, Ekosistem, Produk, Roadmap, Dokumentasi, tombol tema, dan tombol Hubungi Kami.
- Mode tampilan: light mode dan dark mode.
- Footer CTA: ajakan memahami arah ekosistem dan tombol Hubungi JagoFarm.
- Footer utama: ringkasan JagoFarm, status tahap riset awal, navigasi, fokus ekosistem, dan kontak.
- Footer bawah: hak cipta, tanggal dokumentasi, dan tautan kembali ke beranda.

## 1. Beranda

Route: `/`

### Hero

- Slogan: **Smart Farming Circular Future**.
- Deskripsi: riset dan inovasi untuk ekosistem budidaya yang berkelanjutan.
- Visual light mode: `assets/herosection/hero_section_light.webp`.
- Visual dark mode: `assets/herosection/hero_section_dark.webp`.

### Penjelasan Startup

- Judul: **Satu ekosistem, lebih banyak nilai dari sumber daya yang sama.**
- Penjelasan hubungan budidaya ikan, nutrisi, azolla, dan tanaman.
- Tujuan mengurangi sumber daya terbuang dan menghasilkan lebih banyak nilai dari satu lahan.
- Tautan menuju halaman Tentang.

### Alur Ekosistem

Pengantar: **Dari kolam, kembali ke lahan.**

Lima tahap yang ditampilkan:

1. **Budidaya ikan** — nila dan gurame menjadi titik awal pengamatan.
2. **Sisa budidaya** — limbah organik dipelajari sebagai sumber nutrisi.
3. **Azolla dan pupuk** — biomassa dan nutrisi diarahkan menjadi bahan berguna.
4. **Hasil tanaman** — nutrisi digunakan untuk mendukung beragam tanaman; sorgum hanya salah satu contoh saat ini.
5. **Ekosistem sirkular** — ikan, pupuk, azolla, tanaman, dan hasil dihubungkan dalam satu putaran.

Visual yang digunakan:

- Foto asli ikan, azolla, dan tanaman.
- Diagram konseptual pengolahan nutrisi.
- Diagram hubungan ekosistem sirkular.

### Dokumentasi Pilihan

- Kegiatan lapangan.
- Pengukuran media.
- Pertumbuhan tanaman.
- Tautan menuju seluruh dokumentasi.

### Calon Produk

- Ikan nila.
- Ikan gurame.
- Pupuk azolla.
- Pupuk limbah ikan.
- Hasil tanaman.
- Catatan bahwa produk masih berupa arah eksplorasi dan belum menjadi katalog siap jual.

### CTA

- Judul: **Lihat prosesnya. Tanyakan potensinya.**
- Tombol Lihat Dokumentasi.
- Tombol Hubungi Kami.

## 2. Tentang

Route: `/tentang`

### Intro

- Judul: **Tentang JagoFarm**.
- Deskripsi JagoFarm sebagai startup tahap riset yang menghubungkan pertanian dan perikanan dalam satu lahan.

### Latar Belakang

- Foto kegiatan tim di dekat kolam budidaya.
- Penjelasan pemanfaatan ikan, azolla, bahan organik, dan tanaman.
- Penegasan bahwa sistem belum diklaim berhasil.
- Catatan bahwa nama, jabatan, dan sejarah lengkap tim menunggu data resmi.

### Visi, Misi, dan Tujuan

- **Visi:** lahan lebih produktif melalui sistem yang saling mendukung.
- **Misi:** mendokumentasikan kondisi, menyusun hubungan, dan mengevaluasi model secara bertahap.
- **Tujuan:** menghasilkan lebih banyak nilai tanpa menyia-nyiakan sumber daya.

### Tim dan Kegiatan

- Penjelasan fungsi dokumentasi tim sebagai bukti kegiatan.
- Foto tim saat mengamati kolam.
- Tombol menuju halaman Dokumentasi.

## 3. Ekosistem

Route: `/ekosistem`

### Intro

- Judul: **Ekosistem Sirkular**.
- Deskripsi hubungan ikan, nutrisi, azolla, dan tanaman.

### Diagram Ekosistem

- Diagram konseptual satu lahan.
- Komponen: ikan, nutrisi, azolla, tanaman, dan hasil.
- Catatan bahwa diagram belum menggambarkan operasional final.

### Tahapan

1. **Budidaya ikan** — ikan menjadi komponen awal yang terlihat.
2. **Pengamatan nutrisi** — nutrisi dan bahan dicatat sebelum disimpulkan penggunaannya.
3. **Azolla dan biomassa** — azolla diamati sebagai komponen biologis di permukaan kolam.
4. **Pertumbuhan tanaman** — tanaman diamati untuk memahami media dan kondisi pertumbuhan.

### Ringkasan Sistem

- **Input:** lahan, air, kolam, ikan, bahan, dan tanaman.
- **Pengamatan:** kondisi kolam, biomassa, media, dan pertumbuhan.
- **Arah hasil:** ikan, azolla, bahan organik, dan tanaman.

## 4. Produk

Route: `/produk`

### Intro

- Judul: **Calon Hasil Ekosistem**.
- Penjelasan bahwa komoditas masih menjadi arah eksplorasi.

### Daftar Produk

1. **Ikan nila** — hasil budidaya yang sedang diamati.
2. **Ikan gurame** — komoditas ikan kedua dalam pengamatan.
3. **Pupuk azolla** — gagasan pemanfaatan biomassa azolla.
4. **Pupuk limbah ikan** — konsep pengolahan nutrisi budidaya.
5. **Hasil tanaman** — beragam tanaman; sorgum menjadi salah satu contoh saat ini.

Setiap produk menampilkan:

- Nomor urut.
- Foto dokumentasi.
- Status **Dalam eksplorasi**.
- Nama dan penjelasan produk.

### Status Informasi

- Harga belum tersedia.
- Kapasitas belum tersedia.
- Kualitas dan hasil panen belum dapat diverifikasi.
- Jadwal penjualan belum tersedia.

## 5. Roadmap

Route: `/roadmap`

### Intro

- Judul: **Riset & Roadmap**.
- Penjelasan tahapan publik untuk memperjelas model secara bertahap.

### Tahapan Roadmap

1. **Konsep & riset** — merumuskan masalah, tujuan, dan hubungan antarkomponen.
2. **Dokumentasi sumber daya** — mencatat ikan, azolla, bahan, tanaman, dan kondisi lapangan.
3. **Perancangan alur** — menyusun hubungan input, proses, dan hasil.
4. **Pengamatan awal** — mengumpulkan catatan dan pengukuran tanpa klaim hasil akhir.
5. **Evaluasi model** — menentukan bagian yang diteruskan, diubah, atau dihentikan.
6. **Pengembangan bertahap** — menentukan langkah berikutnya setelah bukti tersedia.

Tahap pertama diberi status **Posisi saat ini**. Tahap lainnya diberi status **Tahap berikutnya**.

### Catatan Roadmap

- Roadmap mengikuti bukti, bukan sebaliknya.
- Tahapan dapat berubah berdasarkan dokumentasi, pengukuran, dan evaluasi.
- Tombol menuju bukti lapangan pada halaman Dokumentasi.

## 6. Dokumentasi

Route: `/dokumentasi`

### Intro

- Judul: **Dokumentasi Lapangan**.
- Penegasan bahwa foto nyata tidak berarti seluruh sistem sudah terintegrasi.

### Galeri

Sebelas dokumentasi yang tersedia:

1. Kolam dengan azolla.
2. Bahan dan sampel.
3. Pengamatan ikan.
4. Kegiatan lapangan.
5. Sampel bahan.
6. Kolam budidaya.
7. Instalasi tanaman.
8. Pengukuran media.
9. Persemaian tanaman.
10. Pertumbuhan tanaman.
11. Permukaan azolla.

### Interaksi

- Setiap foto dapat dibuka dalam lightbox.
- Lightbox menampilkan gambar besar, judul, deskripsi, dan tombol tutup.

## 7. Kontak

Route: `/kontak`

### Intro

- Judul: **Hubungi JagoFarm**.
- Catatan bahwa formulir masih berupa simulasi dan belum mengirim data.

### Topik Diskusi

- Konsep ekosistem.
- Dokumentasi dan riset.
- Informasi calon produk.

### Formulir

Field yang tersedia:

- Nama — wajib.
- Organisasi — opsional.
- Jabatan — opsional.
- Email — wajib.
- WhatsApp — wajib.
- Topik — wajib.
- Pesan — wajib.
- Persetujuan untuk dihubungi — wajib.

Pilihan topik:

- Pertanyaan umum.
- Konsep dan riset.
- Informasi produk.
- Dokumentasi.
- Lainnya.

### Status Submit

- Tombol **Kirim Simulasi** tidak mengirim data ke backend.
- Setelah submit, halaman menampilkan status **Simulasi berhasil**.
- Tombol Kembali mengembalikan pengguna ke formulir.

## Data yang Belum Tersedia

- Produk unggulan final.
- Harga dan jadwal penjualan.
- Kapasitas serta hasil panen terverifikasi.
- Profil lengkap anggota tim.
- Integrasi backend formulir kontak.
- Klaim bahwa seluruh ekosistem sudah beroperasi secara penuh.
