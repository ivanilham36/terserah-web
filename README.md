# Terserah! - Frontend (React + Vite)

Antarmuka web untuk aplikasi keputusan kelompok **Terserah!**. Backend ada di repo `terserah-api` (https://github.com/ivanilham36/terserah-api).

Proyek capstone mata kuliah Pengembangan Aplikasi Web Lanjut, Universitas ASA Indonesia.
Penulis: Ivan Muhamad Ilham (24107000711).

## Halaman

- Login dan registrasi.
- Daftar ruang: buat ruang baru atau gabung dengan kode undangan.
- Detail ruang: ranking kandidat dengan rincian skor, suka atau veto, preferensiku (dibaca AI), tambah kandidat (katalog, ide AI, opsi baru), putuskan, dan alasan keputusan dari AI. Data diperbarui otomatis tiap 10 detik.
- Katalog opsi: tambah, ubah, hapus, cari, filter kategori, paginasi, dan ulasan.

## Teknologi

React 18, Vite, react-router-dom 6, axios, react-bootstrap dan Bootstrap 5, js-cookie, react-hot-toast, react-confirm-alert.

## Menjalankan

Pastikan backend sudah berjalan (lihat README `terserah-api`).

```bash
npm install
cp .env.example .env        # PowerShell: Copy-Item .env.example .env
npm run dev
```

Buka http://localhost:5173. Akun demo: `amy@terserah.test` / `password`.

Variabel lingkungan: `VITE_APP_BASEURL` berisi alamat backend (bawaan `http://127.0.0.1:8000`).

## Build produksi

```bash
npm run build
```

Hasilnya ada di folder `dist`.

## Struktur

```
src/api          Konfigurasi axios (token otomatis, penanganan 401)
src/routes       Route dan PrivateRoutes
src/layouts      Layout dengan navbar
src/pages        Login, Register, rooms, options
src/components   Komponen ruang dan opsi
src/utils        Notifikasi
```

