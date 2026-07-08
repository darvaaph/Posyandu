# REKAP Posyandu — Frontend

Implementasi berdasarkan [PRD.md](PRD.md). Dibangun dengan
**Next.js 14 (App Router) + TypeScript + Tailwind CSS**, dengan UI bergaya
shadcn yang ditulis tangan, dan **Supabase** (Auth + PostgreSQL) sebagai backend.

> **Data layer:** Seluruh akses data lewat `src/lib/store.ts` — cache di memori
> + pub/sub yang menulis ke Supabase. Auth (login/register/session) lewat
> `src/contexts/AuthContext.tsx` menggunakan Supabase Auth. RLS membatasi tiap
> kader hanya melihat datanya sendiri. Logika domain (kategorisasi, hitung usia)
> tetap berjalan di sisi klien.

## Setup Supabase

1. Isi `.env.local` (lihat `.env.example`) dengan URL + anon key dari
   Supabase Studio → Settings → API.
2. Jalankan `supabase/schema.sql` di SQL Editor (tabel + RLS, termasuk INSERT
   policy `kader_profiles` yang dibutuhkan registrasi).
3. Jalankan `supabase/functions.sql` (fungsi kategorisasi + view `v_individuals`
   + daftarkan tabel ke Realtime). Opsional tapi mengaktifkan kategori-di-DB &
   realtime; app tetap jalan tanpa ini (fallback ke perhitungan klien).
4. Untuk testing cepat: Auth → Providers → Email → matikan **Confirm email**
   agar register langsung login.

**Realtime:** setelah login, app berlangganan perubahan tabel dan me-reload data
otomatis (debounced) — buka 2 tab untuk melihat sinkron. **Kategorisasi:** logika
ada di `src/lib/kategorisasi.ts` (klien, untuk preview saat mengetik) dan
dicerminkan di `supabase/functions.sql` (DB, sumber kebenaran saat data dibaca).

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:3000
```

Pada Windows tanpa Node global, gunakan launcher portable:

```cmd
scripts\dev.cmd
```

Build produksi:

```bash
npm run build && npm run start
```

## Fitur (MVP)

- **Auth** — register & login kader (mock, sesi di localStorage).
- **CRUD Rumah Tangga & Anggota** — daftar, tambah, detail, edit, hapus.
- **Kategorisasi real-time** — preview kategori saat mengisi tanggal lahir
  (Bayi / Batita / Balita / Remaja / WUS / PUS / Ibu Hamil / Lansia).
- **Dashboard** — ringkasan jumlah per kategori + statistik.
- **Tinjauan bulanan** — warga yang kategorinya berubah, konfirmasi satuan /
  semua.
- **Laporan** — generate per kategori, pratinjau, ekspor PDF (print) & Excel (CSV).
- **Profil kader** — edit profil, reset data contoh.
- **Mobile-first responsive** — bottom nav (mobile) + sidebar (desktop).

## Struktur

```
src/
├── app/            # App Router: (auth) & (app) route groups + halaman
├── components/     # ui/ (primitives), layout/, forms/, cards/, dialogs/, alerts/, common/
├── contexts/       # AuthContext, NotificationContext
├── hooks/          # useData, useKategori, useReviews
└── lib/            # store (mock DB), kategorisasi, date, validation, export, types
```

## Menyambungkan backend nanti

Mock store di `src/lib/store.ts` dan context di `src/contexts/` adalah satu-satunya
titik sentuh data. Ganti pemanggilan `store.*` dengan Supabase / API routes sesuai
PRD §2 tanpa mengubah komponen UI.
