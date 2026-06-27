# SIGAP Posyandu — Frontend

Frontend-only implementation berdasarkan [PRD.md](PRD.md). Dibangun dengan
**Next.js 14 (App Router) + TypeScript + Tailwind CSS**, dengan UI bergaya
shadcn yang ditulis tangan.

> **Catatan:** Versi ini *frontend-only*. Tidak ada Supabase / API routes —
> seluruh data disimpan di **localStorage** browser melalui mock store
> (`src/lib/store.ts`). Logika domain (kategorisasi, hitung usia) berjalan
> penuh di sisi klien, sesuai cerminan logika backend di PRD.

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
