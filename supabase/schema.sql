-- SIGAP Posyandu — Supabase schema + RLS
-- Jalankan di Supabase Studio → SQL Editor.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. KADER PROFILES (linked ke auth.users)
CREATE TABLE IF NOT EXISTS kader_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nama_kader TEXT NOT NULL,
  nama_posyandu TEXT NOT NULL,
  wilayah TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. HOUSEHOLDS
CREATE TABLE IF NOT EXISTS households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kader_id UUID NOT NULL REFERENCES kader_profiles(id) ON DELETE CASCADE,
  no_rumah TEXT NOT NULL,
  no_kk TEXT,                       -- Nomor KK (opsional; unik-jika-ada per kader)
  alamat TEXT NOT NULL,
  dusun TEXT DEFAULT '',
  rt TEXT DEFAULT '',
  rw TEXT DEFAULT '',
  nama_kepala_keluarga TEXT NOT NULL,
  status TEXT DEFAULT 'aktif' CHECK (status IN ('aktif', 'pindah')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(kader_id, no_rumah)
);

-- 3. INDIVIDUALS
CREATE TABLE IF NOT EXISTS individuals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  nik TEXT NOT NULL,
  tanggal_lahir DATE NOT NULL,
  jenis_kelamin TEXT NOT NULL CHECK (jenis_kelamin IN ('L', 'P')),
  peran_dalam_kk TEXT NOT NULL,
  status_kb TEXT DEFAULT 'tidak',
  status_hamil BOOLEAN DEFAULT false,
  perkiraan_tgl_lahir DATE,
  pasangan_id UUID REFERENCES individuals(id) ON DELETE SET NULL,
  kategori_terkonfirmasi TEXT,
  status TEXT DEFAULT 'aktif' CHECK (status IN ('aktif', 'pindah', 'meninggal')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(household_id, nik)
);

-- 4. REPORTS
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kader_id UUID NOT NULL REFERENCES kader_profiles(id) ON DELETE CASCADE,
  judul TEXT NOT NULL,
  kategori TEXT NOT NULL,
  jumlah_data INTEGER DEFAULT 0,
  periode TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_households_kader_id ON households(kader_id);
-- No. KK unik per kader, hanya berlaku saat terisi (yang NULL tidak bentrok)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_households_no_kk
  ON households(kader_id, no_kk) WHERE no_kk IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_individuals_household_id ON individuals(household_id);
CREATE INDEX IF NOT EXISTS idx_individuals_nik ON individuals(nik);
CREATE INDEX IF NOT EXISTS idx_reports_kader_id ON reports(kader_id);

-- ROW LEVEL SECURITY
ALTER TABLE kader_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE individuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- kader_profiles policies
CREATE POLICY "select own kader profile" ON kader_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own kader profile" ON kader_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own kader profile" ON kader_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- households policies
CREATE POLICY "select own households" ON households FOR SELECT
  USING (kader_id IN (SELECT id FROM kader_profiles WHERE user_id = auth.uid()));
CREATE POLICY "insert own households" ON households FOR INSERT
  WITH CHECK (kader_id IN (SELECT id FROM kader_profiles WHERE user_id = auth.uid()));
CREATE POLICY "update own households" ON households FOR UPDATE
  USING (kader_id IN (SELECT id FROM kader_profiles WHERE user_id = auth.uid()));
CREATE POLICY "delete own households" ON households FOR DELETE
  USING (kader_id IN (SELECT id FROM kader_profiles WHERE user_id = auth.uid()));

-- individuals policies (via household ownership)
CREATE POLICY "select own individuals" ON individuals FOR SELECT
  USING (household_id IN (SELECT id FROM households WHERE kader_id IN
    (SELECT id FROM kader_profiles WHERE user_id = auth.uid())));
CREATE POLICY "insert own individuals" ON individuals FOR INSERT
  WITH CHECK (household_id IN (SELECT id FROM households WHERE kader_id IN
    (SELECT id FROM kader_profiles WHERE user_id = auth.uid())));
CREATE POLICY "update own individuals" ON individuals FOR UPDATE
  USING (household_id IN (SELECT id FROM households WHERE kader_id IN
    (SELECT id FROM kader_profiles WHERE user_id = auth.uid())));
CREATE POLICY "delete own individuals" ON individuals FOR DELETE
  USING (household_id IN (SELECT id FROM households WHERE kader_id IN
    (SELECT id FROM kader_profiles WHERE user_id = auth.uid())));

-- reports policies
CREATE POLICY "select own reports" ON reports FOR SELECT
  USING (kader_id IN (SELECT id FROM kader_profiles WHERE user_id = auth.uid()));
CREATE POLICY "insert own reports" ON reports FOR INSERT
  WITH CHECK (kader_id IN (SELECT id FROM kader_profiles WHERE user_id = auth.uid()));
CREATE POLICY "delete own reports" ON reports FOR DELETE
  USING (kader_id IN (SELECT id FROM kader_profiles WHERE user_id = auth.uid()));
