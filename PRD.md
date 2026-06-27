# Architecture & Frontend Structure — SIGAP Posyandu

**Versi:** 1.0  
**Framework:** Next.js 14 + React 18  
**Styling:** Tailwind CSS + shadcn/ui  
**State Management:** React Hooks (useState, useContext)  
**API Client:** Fetch API / Supabase JS Client

---

## 1. Tech Stack Rationale

| Layer | Technology | Alasan |
|---|---|---|
| **Frontend** | Next.js 14 (React 18) | App Router, SSR ready, deploy ke Vercel mudah |
| **Backend/API** | Next.js API Routes | Satu framework, split backend-frontend di folder berbeda |
| **Database** | Supabase (PostgreSQL) | Managed DB + auth terpadu, real-time subscriptions ready |
| **Auth** | Supabase Auth | OAuth2 + password auth built-in, JWT-based |
| **UI Components** | shadcn/ui + Tailwind | Accessible, customizable, fast development |
| **State** | React Hooks + Context | Cukup untuk MVP, tidak perlu Redux |
| **Forms** | React Hook Form + Zod | Validasi type-safe, performa baik |
| **Data Fetching** | SWR atau Fetch + useState | Caching otomatis (SWR), kesederhanaan (Fetch) |

---

## 2. Project Folder Structure

```
sigap-posyandu/
├── .env.local                      # Environment variables (git-ignored)
├── .env.example                    # Contoh env vars
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
│
├── public/                         # Static assets
│   ├── icons/
│   └── images/
│
├── src/
│   ├── app/                        # Next.js App Router (pages + layout)
│   │   ├── layout.tsx              # Root layout + providers
│   │   ├── page.tsx                # Landing / redirect ke login
│   │   ├── globals.css             # Global styles
│   │   │
│   │   ├── (auth)/                 # Auth routes (layout disisip di route)
│   │   │   ├── layout.tsx          # Auth layout (no navbar)
│   │   │   ├── register/
│   │   │   │   └── page.tsx        # /register
│   │   │   └── login/
│   │   │       └── page.tsx        # /login
│   │   │
│   │   ├── (app)/                  # Protected routes (dengan navbar)
│   │   │   ├── layout.tsx          # App layout + navbar
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx        # /dashboard
│   │   │   ├── rumah-tangga/
│   │   │   │   ├── page.tsx        # /rumah-tangga (daftar)
│   │   │   │   ├── tambah/
│   │   │   │   │   └── page.tsx    # /rumah-tangga/tambah
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx    # /rumah-tangga/:id (detail + anggota)
│   │   │   │   │   └── anggota/
│   │   │   │   │       ├── [anggota_id]/
│   │   │   │   │       │   └── page.tsx  # /rumah-tangga/:id/anggota/:anggota_id/edit
│   │   │   │   │       └── tambah/
│   │   │   │   │           └── page.tsx  # /rumah-tangga/:id/anggota/tambah
│   │   │   ├── kategori/
│   │   │   │   └── [nama]/
│   │   │   │       └── page.tsx    # /kategori/:nama
│   │   │   ├── tinjauan/
│   │   │   │   ├── page.tsx        # /tinjauan (daftar)
│   │   │   │   └── [review_id]/
│   │   │   │       └── page.tsx    # /tinjauan/:review_id/konfirmasi
│   │   │   ├── laporan/
│   │   │   │   ├── page.tsx        # /laporan (riwayat)
│   │   │   │   └── generate/
│   │   │   │       └── page.tsx    # /laporan/generate
│   │   │   └── profil/
│   │   │       └── page.tsx        # /profil
│   │   │
│   │   └── api/                    # API Routes (backend)
│   │       ├── auth/
│   │       │   ├── register.ts
│   │       │   ├── login.ts
│   │       │   ├── logout.ts
│   │       │   └── refresh.ts
│   │       ├── kader/
│   │       │   └── profile.ts
│   │       ├── rumah-tangga/
│   │       │   ├── index.ts        # GET, POST
│   │       │   └── [id]/
│   │       │       ├── index.ts    # GET, PUT, DELETE
│   │       │       └── anggota/
│   │       │           ├── index.ts
│   │       │           └── [anggota_id]/
│   │       │               └── index.ts
│   │       ├── kategori/
│   │       │   ├── index.ts
│   │       │   ├── [nama].ts       # GET /api/kategori/:nama
│   │       │   └── summary.ts      # GET /api/kategori/summary
│   │       ├── tinjauan/
│   │       │   ├── index.ts        # GET, PUT /api/tinjauan/konfirmasi-semua
│   │       │   └── [id]/
│   │       │       └── konfirmasi.ts
│   │       ├── laporan/
│   │       │   ├── index.ts        # GET, DELETE
│   │       │   ├── generate.ts     # POST
│   │       │   └── [id]/
│   │       │       └── export/
│   │       │           ├── pdf.ts
│   │       │           └── excel.ts
│   │       └── dashboard.ts        # GET /api/dashboard
│   │
│   ├── components/                 # Reusable React components
│   │   ├── layout/
│   │   │   ├── Navbar.tsx          # Top navigation bar
│   │   │   ├── BottomNav.tsx       # Bottom navigation (mobile)
│   │   │   ├── Sidebar.tsx         # Sidebar (opsional, untuk desktop)
│   │   │   └── AuthLayout.tsx      # Wrapper untuk auth pages
│   │   │
│   │   ├── cards/
│   │   │   ├── KategoriCard.tsx    # Card ringkasan kategori
│   │   │   ├── HouseholdCard.tsx   # Card rumah tangga
│   │   │   └── IndividualCard.tsx  # Card individu
│   │   │
│   │   ├── forms/
│   │   │   ├── LoginForm.tsx       # Form login
│   │   │   ├── RegisterForm.tsx    # Form registrasi
│   │   │   ├── HouseholdForm.tsx   # Form rumah tangga (tambah/edit)
│   │   │   ├── IndividualForm.tsx  # Form anggota keluarga (inti)
│   │   │   ├── ReportForm.tsx      # Form generate laporan
│   │   │   └── ProfileForm.tsx     # Form edit profil
│   │   │
│   │   ├── tables/
│   │   │   ├── HouseholdTable.tsx  # Tabel daftar rumah tangga
│   │   │   ├── KategoriTable.tsx   # Tabel per kategori
│   │   │   ├── ReviewTable.tsx     # Tabel tinjauan bulanan
│   │   │   └── ReportTable.tsx     # Tabel riwayat laporan
│   │   │
│   │   ├── dialogs/
│   │   │   ├── ConfirmDeleteDialog.tsx
│   │   │   ├── PreviewReportDialog.tsx
│   │   │   └── ExportDialog.tsx
│   │   │
│   │   ├── alerts/
│   │   │   ├── ReviewNotification.tsx   # Banner notifikasi tinjauan
│   │   │   ├── StatusAlert.tsx
│   │   │   └── ErrorAlert.tsx
│   │   │
│   │   └── common/
│   │       ├── LoadingSpinner.tsx
│   │       ├── EmptyState.tsx
│   │       ├── Pagination.tsx
│   │       ├── SearchBar.tsx
│   │       └── Badge.tsx
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuth.ts              # Auth state + login/logout/register
│   │   ├── useHouseholds.ts        # Fetch & cache rumah tangga
│   │   ├── useIndividuals.ts       # Fetch & cache anggota
│   │   ├── useKategori.ts          # Fetch kategori + detil
│   │   ├── useReviews.ts           # Fetch tinjauan bulanan
│   │   ├── useReports.ts           # Fetch laporan
│   │   └── useFetch.ts             # Generic fetch wrapper
│   │
│   ├── contexts/                   # React Context
│   │   ├── AuthContext.tsx         # User + session state
│   │   ├── KaderContext.tsx        # Kader profile state
│   │   └── NotificationContext.tsx # Toast/alert state
│   │
│   ├── lib/                        # Utility functions & helpers
│   │   ├── supabase.ts             # Supabase client initialization
│   │   ├── api.ts                  # API client wrapper
│   │   ├── auth.ts                 # Auth helper functions
│   │   ├── kategorisasi.ts         # Kategorisasi helper (mirror backend logic)
│   │   ├── export.ts               # Export PDF/Excel helper
│   │   ├── validation.ts           # Form validation schemas (Zod)
│   │   ├── date.ts                 # Date formatting utilities
│   │   └── constants.ts            # App constants (kategori list, icons, dll)
│   │
│   ├── types/                      # TypeScript interfaces
│   │   ├── index.ts                # Export semua types
│   │   ├── database.ts             # Database entity types (auto-generate dari DB)
│   │   ├── api.ts                  # API request/response types
│   │   ├── forms.ts                # Form input types
│   │   └── common.ts               # Common types (pagination, error, dll)
│   │
│   └── styles/                     # Global & component styles
│       ├── globals.css             # Global Tailwind + custom CSS
│       └── variables.css           # CSS variables (colors, spacing)
│
└── tests/                          # Testing (opsional untuk MVP)
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## 3. Component Breakdown (MVP Features)

### 3.1 Layout Components

**Navbar.tsx**
- Tampilkan nama kader + nama posyandu
- Icon notifikasi (badge jumlah tinjauan belum dikonfirmasi)
- Button logout
- Responsive: hamburger menu di mobile

**BottomNav.tsx**
- Tab bar bawah (mobile)
- 5 menu: Dashboard · Data Warga · Tinjauan · Laporan · Profil
- Active state highlight

**AppLayout.tsx**
- Wrap semua protected routes
- Include Navbar + BottomNav
- Redirect ke login jika belum auth

---

### 3.2 Form Components

**IndividualForm.tsx** (Halaman Inti)
```
Input fields:
- Nama (text, wajib)
- NIK (text, 16 digit, validation: format + duplikat check via API)
- Tanggal Lahir (date picker, wajib) ← TRIGGER real-time kategori preview
- Jenis Kelamin (radio: L/P, wajib)
- Peran dalam KK (dropdown: KK/istri/anak/lainnya, wajib)
- Status KB (dropdown: tidak/pil/suntik/iud/implan/lainnya, kondisional)
- Sedang Hamil (toggle, hanya untuk WUS) + Perkiraan Tgl Lahir (date picker)
- Pilih Pasangan (searchable select, hanya jika peran = istri)
- Status (dropdown: aktif/pindah/meninggal, default: aktif)

Display otomatis:
- Info box: "3 tahun 2 bulan — Kategori: Balita" (non-editable, updated real-time)
- Peringatan jika NIK duplikat (dengan link ke individu yang duplikat)
```

**HouseholdForm.tsx**
```
Input:
- Nomor Rumah (text)
- Alamat (text area)
- Dusun/RT/RW (text)
- Nama Kepala Keluarga (text)
- Status (dropdown: aktif/pindah)
```

---

### 3.3 Table & List Components

**KategoriTable.tsx**
- Untuk display `/kategori/:nama`
- Columns: Nama, NIK, Usia, Tanggal Lahir, Alamat, Aksi (edit/delete)
- Untuk PUS: 1 baris = istri + suami (columns tambah: Nama Pasangan, Status KB Pasangan)
- Search bar, filter dusun/RT-RW
- Sort by: nama, usia, tanggal tambah

**ReviewTable.tsx**
- Columns: Nama, Kategori Lama → Baru, Usia, Aksi (Konfirmasi / Tinjau Nanti)
- Bulk action: "Konfirmasi Semua"

---

### 3.4 Card Components

**KategoriCard.tsx**
```
Display:
- Icon kategori (👶 / 🚶 / 🧒 / 👦 / 👩 / 👫 / 🤰 / 👴)
- Nama kategori (Bayi / Batita / Balita / Remaja / WUS / PUS / Ibu Hamil / Lansia)
- Jumlah individu (e.g., "12")
- Tap → navigate ke /kategori/:nama
```

---

### 3.5 Alert & Dialog Components

**ReviewNotification.tsx**
- Yellow/amber banner di dashboard
- Text: "X warga perlu ditinjau bulan ini"
- Tap → navigate ke /tinjauan
- Dismiss option

**PreviewReportDialog.tsx**
- Modal dengan data laporan sebelum export
- Show: kategori, jumlah data, timestamp
- Action: Export PDF, Export Excel, Close

---

## 4. State Management & Data Flow

### 4.1 Auth State (Context)

```typescript
// AuthContext.tsx
type AuthState = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
};

type AuthContextType = {
  state: AuthState;
  register: (email, password, nama_kader, nama_posyandu, wilayah) => Promise<void>;
  login: (email, password) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
};
```

**Flow:**
1. App load → check localStorage untuk existing session
2. Jika ada session, validate dengan backend
3. Jika valid, set user + session state
4. Jika invalid, clear session, redirect ke login

---

### 4.2 Kader Profile State (Context)

```typescript
type KaderProfile = {
  id: string;
  user_id: string;
  nama_kader: string;
  nama_posyandu: string;
  wilayah: string;
  created_at: string;
};

// Fetch di app load (setelah auth sukses)
```

---

### 4.3 Data Fetching Pattern (Hook + Context)

```typescript
// useHouseholds.ts
type UseHouseholdsReturn = {
  households: Household[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  add: (data: HouseholdInput) => Promise<Household>;
  update: (id: string, data: HouseholdInput) => Promise<Household>;
  delete: (id: string) => Promise<void>;
};
```

**Pattern:**
- Initial state: `{ data: null, loading: true, error: null }`
- Fetch pada component mount
- Refetch saat needed (e.g., setelah add/update)
- Cache data di component state (simple approach untuk MVP)
- Opsional: use SWR untuk caching otomatis

---

## 5. Data Flow Diagram

```
┌─────────────────┐
│   Browser       │
│   (React App)   │
└────────┬────────┘
         │ HTTP
         ▼
┌──────────────────────────────────────┐
│   Next.js API Routes (Backend)       │
│  - /api/auth/* (login, register)     │
│  - /api/rumah-tangga/*               │
│  - /api/kategori/*                   │
│  - /api/tinjauan/*                   │
│  - /api/laporan/*                    │
│  - /api/dashboard                    │
└────────┬─────────────────────────────┘
         │ SQL + Computed Functions
         ▼
┌──────────────────────────────────────┐
│   Supabase (PostgreSQL)              │
│  - Tables: kader_profiles, households│
│  - Tables: individuals, reviews      │
│  - Functions: hitung_usia()          │
│  - Functions: tentukan_kategori()    │
└──────────────────────────────────────┘
```

---

## 6. Key Implementation Patterns

### 6.1 Protected Routes

```typescript
// app/(app)/layout.tsx
export default function AppLayout({ children }) {
  const { state } = useContext(AuthContext);
  
  if (!state.user) {
    redirect('/login');
  }
  
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <BottomNav />
    </>
  );
}
```

### 6.2 Real-time Kategori Preview (IndividualForm)

```typescript
// components/forms/IndividualForm.tsx
const [tanggalLahir, setTanggalLahir] = useState<Date | null>(null);

const handleTanggalLahirChange = (date: Date) => {
  setTanggalLahir(date);
  if (date) {
    const kategori = kategorisasi.tentukan_kategori(
      date,
      jenis_kelamin,
      status_hamil,
      pasangan_id
    );
    setKategoriPreview(kategori);
  }
};

return (
  <>
    <input
      type="date"
      onChange={(e) => handleTanggalLahirChange(new Date(e.target.value))}
    />
    {kategoriPreview && (
      <div className="info-box">
        {umurDisplay} — Kategori: {kategoriPreview.kategori_utama}
      </div>
    )}
  </>
);
```

### 6.3 Error Handling & User Feedback

```typescript
// Contoh di Rumah Tangga form saat create
try {
  const response = await fetch('/api/rumah-tangga', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    if (error.code === 'CONFLICT') {
      // no_rumah sudah ada
      showNotification('Nomor rumah sudah terdaftar', 'error');
    } else {
      showNotification(error.error, 'error');
    }
    return;
  }
  
  const result = await response.json();
  showNotification('Rumah tangga berhasil ditambahkan', 'success');
  navigate('/rumah-tangga');
} catch (error) {
  showNotification('Network error', 'error');
}
```

### 6.4 Validation (Zod + React Hook Form)

```typescript
// lib/validation.ts
import { z } from 'zod';

export const IndividualSchema = z.object({
  nik: z.string()
    .length(16, 'NIK harus 16 digit')
    .regex(/^\d+$/, 'NIK hanya angka'),
  nama: z.string().min(3, 'Nama minimal 3 karakter'),
  tanggal_lahir: z.date(),
  jenis_kelamin: z.enum(['L', 'P']),
  peran_dalam_kk: z.enum(['kepala_keluarga', 'istri', 'anak', 'anggota_lain']),
  status_kb: z.string().optional(),
  status_hamil: z.boolean().default(false),
  // ... field lainnya
});

// components/forms/IndividualForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(IndividualSchema),
  defaultValues: { ... }
});
```

---

## 7. Mobile-First Responsive Design

**Breakpoints (Tailwind):**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

**Layout Strategy:**
- **Mobile (< 768px):** Single column, full-width cards, bottom nav, hamburger menu
- **Tablet (768px - 1024px):** 2 columns, side-by-side cards, top bar
- **Desktop (> 1024px):** 3+ columns, sidebar optional, full layout

**Example:**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 column mobile, 2 tablet, 3 desktop */}
</div>
```

---

## 8. Performance Optimization

### 8.1 Code Splitting
```typescript
// app/(app)/laporan/page.tsx
import dynamic from 'next/dynamic';

const ReportForm = dynamic(() => import('@/components/forms/ReportForm'), {
  loading: () => <LoadingSpinner />
});
```

### 8.2 Image Optimization
```jsx
import Image from 'next/image';

<Image
  src="/images/logo.png"
  alt="Logo"
  width={200}
  height={200}
  priority // untuk above-the-fold images
/>
```

### 8.3 Memoization (untuk expensive renders)
```typescript
import { memo } from 'react';

const KategoriCard = memo(({ data }) => {
  return <div>{data.count}</div>;
});
```

---

## 9. Environment Setup

**.env.local:**
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_KEY=xxxxx

# App
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api (dev)
                        =https://sigap-posyandu.vercel.app/api (prod)
NEXT_PUBLIC_APP_ENV=development | production
```

---

## 10. Build & Deployment

**Development:**
```bash
npm run dev
# http://localhost:3000
```

**Build:**
```bash
npm run build
npm run start
```

**Deploy ke Vercel:**
```bash
# Push ke GitHub
# Vercel auto-detect Next.js
# Deploy ke production
```

**Database Migrations:**
```bash
# Manual SQL via Supabase Studio
# Atau gunakan migration tool (opsional: liquibase, flyway)
```

---

## 11. Security Best Practices

1. **API Key:** Jangan hardcode; gunakan environment variables
2. **CORS:** Whitelist origins yang diizinkan (Vercel URL + localhost dev)
3. **Rate Limiting:** Implement di API routes (login max 5/15min, others 100/min)
4. **Input Validation:** Zod di frontend + backend
5. **SQL Injection:** Gunakan parameterized queries (Supabase client auto-handle)
6. **XSS Prevention:** React auto-escape, sanitize user input jika perlu
7. **CSRF:** Next.js built-in protection untuk API routes
8. **JWT:** Store token di HTTP-only cookie (opsional, atau sessionStorage)

---

## 12. Testing Strategy (Opsional untuk MVP, tapi disarankan)

### 12.1 Unit Tests
```typescript
// lib/__tests__/kategorisasi.test.ts
import { tentukan_kategori } from '@/lib/kategorisasi';

test('Usia 2 tahun masuk Batita', () => {
  const kategori = tentukan_kategori(
    new Date('2024-01-01'),
    'P',
    false,
    null
  );
  expect(kategori.kategori_utama).toBe('Batita');
});
```

### 12.2 Integration Tests
```typescript
// tests/api/rumah-tangga.test.ts
describe('POST /api/rumah-tangga', () => {
  test('Tambah rumah tangga berhasil', async () => {
    const response = await fetch('/api/rumah-tangga', { ... });
    expect(response.status).toBe(201);
    expect(response.body.no_rumah).toBe('002');
  });
});
```

### 12.3 E2E Tests
```typescript
// tests/e2e/create-household.spec.ts (Playwright)
test('Kader bisa tambah rumah tangga', async ({ page }) => {
  await page.goto('/rumah-tangga/tambah');
  await page.fill('[name="no_rumah"]', '002');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/rumah-tangga');
});
```

---

## 13. Monitoring & Analytics (Post-MVP)

- **Error tracking:** Sentry
- **Performance monitoring:** Vercel Analytics
- **User analytics:** Posthog (privacy-first)

---

## 14. Documentation & Handoff

**Keep updated:**
- API docs (OpenAPI/Swagger opsional)
- Component storybook (opsional, tapi berguna)
- Deployment guide untuk team
- Troubleshooting guide

---

## 15. MVP vs. Future Enhancements

**MVP (7 hari, fokus):**
- Auth (register, login)
- CRUD rumah tangga & anggota
- Real-time kategori calculation
- Tinjauan bulanan + konfirmasi
- Generate & export laporan PDF/Excel
- Dashboard summary
- Mobile-responsive

**v1.1 (Roadmap):**
- Modul Pokja 4 PKK (dashboard monitoring SIP, cakupan KB)
- Export gabungan laporan desa
- Undo/redo untuk aksi individual

**v2.0 (Jangka panjang):**
- Integrasi ASIK / SIM PKK
- Pencatatan kehamilan penuh (ANC)
- PWA dengan offline mode
- Multi-bahasa