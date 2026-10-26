# JagoFarm

![Momen terbaik bersama JagoFarm](assets/jagofarm-momen-terbaik.png)

Website React/Vite dengan pilihan bahasa Indonesia dan Inggris, tema terang/gelap, katalog produk, album proyek, dan profil tim.

## Development

Gunakan Node.js 22.12 atau lebih baru. Versi 22.20.0 digunakan dalam pemeriksaan deployment.

```sh
npm ci
npm run dev
```

### Menjalankan CMS Admin

CMS lokal untuk mengelola produk dan proyek (berjalan di `http://localhost:3333`):

1. Buat file `.env` dari `.env.example`:
   ```sh
   cp .env.example .env
   ```
2. Sesuaikan kredensial di `.env`:
   ```ini
   CMS_ADMIN_EMAIL=admin@jagofarm.dev
   CMS_ADMIN_PASSWORD=password_anda
   CMS_SESSION_SECRET=secret_acak_anda
   ```
3. Jalankan server CMS:
   ```sh
   npm run cms
   ```
4. Buka `http://localhost:3333` di browser dan masuk menggunakan email serta password yang telah dikonfigurasi.

## Deployment

Deploy sebagai website statis pada root domain. Bahasa Indonesia menggunakan rute default; versi Inggris memakai awalan `/en/`.

| Pengaturan | Nilai |
| --- | --- |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output / publish directory | `dist` |
| Entry file | `dist/index.html` |
| Environment variables | Tidak diperlukan |

Upload seluruh isi `dist`, termasuk direktori rute yang sudah di-prerender (`dist/tentang/index.html`, `dist/en/produk/index.html`, dan seterusnya), aset, `robots.txt`, `sitemap.xml`, serta `404.html`. Setiap halaman rute tersedia sebagai HTML statis; hosting tidak memerlukan rewrite SPA. Pastikan hosting mempertahankan path direktori dan mengembalikan `404.html` untuk path yang tidak ada. Halaman memuat font dari Google Fonts; font lokal bawaan browser digunakan sebagai fallback.

Perubahan source, `package-lock.json`, dan aset baru di `public/assets` perlu disertakan jika hosting membangun dari Git.

## Pemeriksaan sebelum deploy

```sh
npm ci
npm audit
node src/team-navigation.test.js
node src/routing.test.js
node src/metadata.test.js
npm run build
npm run preview
```

Setelah `npm run preview` berjalan, periksa respons dan HTML mentah sebelum JavaScript dimuat:

```sh
curl -i http://localhost:4173/
curl -i http://localhost:4173/produk/
curl -i http://localhost:4173/tentang/
curl -i http://localhost:4173/proyek/iot/
curl -i http://localhost:4173/en/
curl -i http://localhost:4173/en/produk/
```

Pastikan judul, deskripsi, canonical, hreflang, konten utama, dan JSON-LD homepage sudah ada pada HTML awal. Periksa juga navigasi path, pergantian bahasa/tema, dialog tim dengan keyboard, filter produk, album proyek, tautan scroll Tentang-ke-platform, pengalihan hash lama, refresh langsung, tampilan desktop/mobile, serta tidak adanya error console atau peringatan hydration. Vite preview menyajikan keluaran statis `dist` untuk pemeriksaan lokal.
