# 📖 Panduan Penggunaan SIGAP Posyandu

**SIGAP Posyandu** (Sistem Informasi Gizi & Pencatatan Posyandu) adalah aplikasi web untuk membantu kader mencatat data warga, mengelompokkan kategori sasaran secara otomatis, memantau perubahan kategori bulanan, dan membuat laporan — termasuk **mengisi data otomatis dari foto Kartu Keluarga (KK)** menggunakan AI.

> Alamat aplikasi: **https://posyandu-one.vercel.app**

---

## Daftar Isi
1. [Memasang Aplikasi di HP (PWA)](#1-memasang-aplikasi-di-hp-pwa)
2. [Daftar & Masuk](#2-daftar--masuk)
3. [Lupa Password](#3-lupa-password)
4. [Mengenal Tampilan](#4-mengenal-tampilan)
5. [Menambah Data Warga](#5-menambah-data-warga)
6. [Memahami Kategori Sasaran](#6-memahami-kategori-sasaran)
7. [Tinjauan Bulanan](#7-tinjauan-bulanan)
8. [Membuat & Mengekspor Laporan](#8-membuat--mengekspor-laporan)
9. [Profil & Keluar](#9-profil--keluar)
10. [Penggunaan Offline](#10-penggunaan-offline)
11. [Tips & Pemecahan Masalah](#11-tips--pemecahan-masalah)

---

## 1. Memasang Aplikasi di HP (PWA)

Aplikasi ini bisa dipasang di layar utama HP seperti aplikasi biasa, **tanpa Play Store / App Store**.

### 📱 Android (Chrome)
1. Buka **https://posyandu-one.vercel.app** di **Google Chrome**.
2. Ketuk menu titik tiga (**⋮**) di kanan atas.
3. Pilih **"Tambahkan ke Layar utama"** atau **"Instal aplikasi"**.
4. Ketuk **Instal/Tambah**. Ikon SIGAP 👶 muncul di layar utama.

### 🍏 iPhone / iPad (Safari)
1. Buka alamat aplikasi di **Safari** (harus Safari, bukan Chrome).
2. Ketuk tombol **Bagikan** (kotak dengan panah ke atas).
3. Gulir, pilih **"Tambahkan ke Layar Utama"**.
4. Ketuk **Tambah**.

### 💻 Laptop/Desktop
Cukup buka alamatnya di browser. Di Chrome/Edge ada ikon **instal** (⊕) di ujung kanan kolom alamat bila ingin dipasang sebagai aplikasi.

---

## 2. Daftar & Masuk

### Mendaftar (kader baru)
1. Buka aplikasi → di kartu masuk, ketuk tab **Daftar**.
2. Isi: **Nama Kader**, **Nama Posyandu**, **Wilayah**, **Email**, **Password** (min. 6 karakter).
3. Ketuk **Daftar**. Anda langsung masuk ke Dashboard.

### Masuk (login)
1. Di tab **Masuk**, isi **Email** dan **Password**.
2. Ketuk ikon 👁 untuk melihat password bila perlu.
3. Ketuk **Masuk**.

> 🔒 Setiap kader hanya bisa melihat **data miliknya sendiri**. Data kader lain tidak akan tercampur.

---

## 3. Lupa Password

1. Di halaman **Masuk**, ketuk **"Lupa password?"**.
2. Masukkan email terdaftar → ketuk **Kirim Link Reset**.
3. Buka email Anda (cek juga folder **Spam**), klik link di dalamnya.
4. Anda diarahkan ke halaman **Buat Password Baru** → isi password baru + konfirmasi → **Simpan**.
5. Masuk kembali dengan password baru.

> Demi keamanan, aplikasi selalu menampilkan "Email terkirim" meski email tidak terdaftar (mencegah penyalahgunaan). Bila tidak ada email masuk, periksa kembali ejaan email Anda.

---

## 4. Mengenal Tampilan

Menu utama ada di **bilah bawah** (HP) atau **samping kiri** (desktop):

| Menu | Fungsi |
|---|---|
| 🏠 **Dashboard** | Ringkasan jumlah warga per kategori |
| 👥 **Data Warga** | Daftar rumah tangga + tambah/cari/filter |
| ✅ **Tinjauan** | Warga yang berubah kategori bulan ini |
| 📄 **Laporan** | Buat & ekspor laporan |
| 👤 **Profil** | Data kader & keluar |

Lonceng 🔔 di pojok kanan atas menampilkan jumlah warga yang perlu ditinjau.

---

## 5. Menambah Data Warga

Buka **Data Warga → Tambah**. Ada **dua cara**:

### Cara A — Otomatis dari Foto KK (AI) ⭐
1. Di kartu **"Isi otomatis dari foto KK"**, ketuk **Ambil Foto** (kamera) atau **Unggah Gambar** (galeri).
2. Tunggu beberapa detik — AI membaca seluruh anggota keluarga.
3. Anda masuk ke layar **"Periksa Hasil Baca KK"**:
   - Periksa nomor rumah, nama kepala keluarga, alamat, desa/RT/RW.
   - Periksa setiap anggota (nama, NIK, tanggal lahir, jenis kelamin, peran).
   - Bila ada peringatan ⚠️ **"Tanggal lahir tidak cocok dengan NIK"**, ketuk **Pakai** untuk memakai tanggal dari NIK, atau perbaiki manual.
   - **Wajib isi Nomor Rumah** sebelum menyimpan.
4. Ketuk **Simpan Semua**.

> 📌 **Foto KK tidak disimpan.** Gambar hanya diproses sesaat lalu dibuang demi privasi.
> 📌 Hasil AI **wajib diperiksa** — AI bisa salah baca, terutama tulisan buram.

**Jika foto bukan KK / terlalu buram:** aplikasi menampilkan pesan *"Gambar tidak dikenali sebagai Kartu Keluarga"* dan Anda tetap di halaman. Foto ulang KK dengan pencahayaan baik dan posisi lurus.

### Cara B — Isi Manual
Di bawah pemisah **"atau isi manual"**, isi formulir rumah tangga, simpan, lalu buka detailnya untuk menambah anggota satu per satu.

Saat mengisi anggota, **kategori muncul otomatis** begitu tanggal lahir diisi. NIK divalidasi 16 digit dan dicek agar tidak ganda.

---

## 6. Memahami Kategori Sasaran

Sistem menentukan kategori **otomatis** dari tanggal lahir, jenis kelamin, status hamil, dan status pasangan:

| Kategori | Kriteria |
|---|---|
| 🍼 Bayi | < 12 bulan |
| 🚼 Batita | 1–2 tahun (12–35 bulan) |
| 🧒 Balita | 3–4 tahun (36–59 bulan) |
| 🧑 Remaja | 10–18 tahun |
| 👩 WUS | Perempuan 15–49 tahun |
| 🤰 Ibu Hamil | WUS yang sedang hamil |
| 👫 PUS | Punya pasangan, usia 15–49 tahun (suami & istri) |
| 👴 Lansia | 60 tahun ke atas |

Satu warga bisa masuk **beberapa kategori** sekaligus. Ketuk kartu kategori di Dashboard untuk melihat daftar warganya dan mengekspornya.

---

## 7. Tinjauan Bulanan

Seiring waktu, warga berpindah kategori (mis. bayi menjadi batita). Menu **Tinjauan** menampilkan warga yang kategorinya berubah dan belum dikonfirmasi.

- **Progress bar** menunjukkan berapa yang sudah dikonfirmasi.
- Ketuk **Konfirmasi** pada tiap warga, atau **Konfirmasi Semua** sekaligus.

---

## 8. Membuat & Mengekspor Laporan

1. Buka **Laporan → Generate**.
2. Pilih **Kategori** (atau "Semua Warga") dan **Periode**.
3. Ketuk **Pratinjau** untuk melihat datanya.
4. Ekspor:
   - **Export PDF** → membuka tampilan cetak → simpan sebagai PDF.
   - **Export Excel (CSV)** → unduh berkas, bisa dibuka di Excel.

Laporan tersimpan di daftar **Laporan** dan bisa diekspor ulang kapan saja. Anda juga bisa mengekspor langsung dari halaman daftar kategori (CSV / PDF).

---

## 9. Profil & Keluar

- **Profil** → ubah Nama Kader, Nama Posyandu, Wilayah.
- **Keluar** → ketuk ikon keluar (↩) di kanan atas; akan ada konfirmasi sebelum benar-benar keluar.

---

## 10. Penggunaan Offline

Setelah aplikasi dipasang dan pernah dibuka, ia tetap dapat diakses saat **tidak ada internet** — akan tampil halaman **"Tidak ada koneksi"** dengan tombol **Muat Ulang**.

> ⚠️ Catatan: penyimpanan dan pembacaan KK (AI) **membutuhkan internet**. Menyimpan data warga juga butuh koneksi karena tersimpan ke server. Pastikan online saat menginput data.

---

## 11. Tips & Pemecahan Masalah

**📷 Agar AI membaca KK dengan akurat:**
- Foto di tempat terang, hindari bayangan dan pantulan cahaya.
- Posisikan KK lurus dan penuhi bingkai (semua kolom terlihat).
- Pastikan tulisan tidak buram. Selalu **periksa hasilnya** sebelum simpan.

**❓ "Gambar tidak dikenali sebagai Kartu Keluarga"** → foto yang diunggah bukan KK atau terlalu buram. Foto ulang KK dengan jelas.

**❓ NIK ditolak / "harus 16 digit"** → NIK harus tepat 16 angka tanpa spasi.

**❓ "Nomor rumah sudah terdaftar"** → nomor rumah sudah dipakai rumah tangga lain; gunakan nomor berbeda.

**❓ Email reset password tidak masuk** → cek folder Spam; pastikan ejaan email benar; tunggu beberapa menit lalu kirim ulang.

**❓ Tampilan terlihat aneh / tidak ter-update** → tutup dan buka ulang aplikasi, atau muat ulang halaman.

---

*Dokumen ini adalah panduan pengguna SIGAP Posyandu. Untuk pertanyaan lebih lanjut, hubungi pengelola/admin posyandu Anda.*
