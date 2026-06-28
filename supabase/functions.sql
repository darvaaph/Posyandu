-- SIGAP Posyandu — Kategorisasi sebagai Postgres function + Realtime
-- Jalankan di Supabase Studio -> SQL Editor SETELAH schema.sql.

-- =========================================================
-- 1. FUNGSI KATEGORISASI (cerminan src/lib/kategorisasi.ts)
-- =========================================================

-- Usia dalam total bulan (memperhitungkan tanggal, sama seperti hitungUsia di klien).
CREATE OR REPLACE FUNCTION hitung_usia_bulan(tgl DATE)
RETURNS INT
LANGUAGE sql
STABLE
AS $$
  SELECT (EXTRACT(YEAR FROM age(tgl)) * 12 + EXTRACT(MONTH FROM age(tgl)))::INT;
$$;

-- Semua kategori yang berlaku untuk seorang individu (boleh lebih dari satu).
CREATE OR REPLACE FUNCTION tentukan_kategori_semua(
  tgl DATE,
  jenis_kelamin TEXT,
  status_hamil BOOLEAN,
  punya_pasangan BOOLEAN
)
RETURNS TEXT[]
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  m INT := hitung_usia_bulan(tgl);
  y INT := floor(m / 12);
  cats TEXT[] := '{}';
BEGIN
  -- Kelompok usia anak (berbasis bulan)
  IF m < 12 THEN
    cats := array_append(cats, 'Bayi');
  ELSIF m < 36 THEN
    cats := array_append(cats, 'Batita');
  ELSIF m < 60 THEN
    cats := array_append(cats, 'Balita');
  END IF;

  -- Remaja 10..18
  IF y >= 10 AND y <= 18 THEN
    cats := array_append(cats, 'Remaja');
  END IF;

  -- Lansia 60+
  IF y >= 60 THEN
    cats := array_append(cats, 'Lansia');
  END IF;

  -- Wanita Usia Subur 15..49
  IF jenis_kelamin = 'P' AND y >= 15 AND y <= 49 THEN
    cats := array_append(cats, 'WUS');
    IF status_hamil THEN
      cats := array_append(cats, 'Ibu Hamil');
    END IF;
  END IF;

  -- PUS: Pasangan Usia Subur — suami/istri yang punya pasangan & usia 15..49.
  -- (Suami masuk PUS tapi TIDAK masuk WUS.)
  IF punya_pasangan AND y >= 15 AND y <= 49 THEN
    cats := array_append(cats, 'PUS');
  END IF;

  -- Warga di luar kelompok sasaran (pria dewasa 19-59, anak 5-9) tidak diberi label.
  RETURN cats;
END;
$$;

-- Kategori utama (prioritas tertinggi untuk label).
CREATE OR REPLACE FUNCTION tentukan_kategori(
  tgl DATE,
  jenis_kelamin TEXT,
  status_hamil BOOLEAN,
  punya_pasangan BOOLEAN
)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  cats TEXT[] := tentukan_kategori_semua(tgl, jenis_kelamin, status_hamil, punya_pasangan);
  prioritas TEXT[] := ARRAY['Ibu Hamil','Bayi','Batita','Balita','PUS','WUS','Remaja','Lansia'];
  p TEXT;
BEGIN
  FOREACH p IN ARRAY prioritas LOOP
    IF p = ANY(cats) THEN
      RETURN p;
    END IF;
  END LOOP;
  RETURN cats[1];
END;
$$;

-- =========================================================
-- 2. VIEW: individu + kategori terhitung di DB
--    security_invoker = true  => RLS tabel individuals tetap berlaku
--    (WAJIB, kalau tidak view akan membocorkan semua baris).
-- =========================================================
CREATE OR REPLACE VIEW v_individuals
WITH (security_invoker = true)
AS
SELECT
  i.*,
  hitung_usia_bulan(i.tanggal_lahir) AS usia_bulan,
  tentukan_kategori(
    i.tanggal_lahir, i.jenis_kelamin, i.status_hamil, (i.pasangan_id IS NOT NULL)
  ) AS kategori_utama,
  tentukan_kategori_semua(
    i.tanggal_lahir, i.jenis_kelamin, i.status_hamil, (i.pasangan_id IS NOT NULL)
  ) AS kategori_semua
FROM individuals i;

-- =========================================================
-- 3. REALTIME: daftarkan tabel ke publication supabase_realtime
--    (idempotent — aman dijalankan berulang).
-- =========================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'households'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.households;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'individuals'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.individuals;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'reports'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
  END IF;
END;
$$;
