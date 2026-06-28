// Domain types for SIGAP Posyandu (frontend-only)

export type JenisKelamin = "L" | "P";

export type PeranKK = "kepala_keluarga" | "istri" | "anak" | "anggota_lain";

export type StatusKB =
  | "tidak"
  | "pil"
  | "suntik"
  | "iud"
  | "implan"
  | "lainnya";

export type StatusIndividu = "aktif" | "pindah" | "meninggal";

export type StatusRumahTangga = "aktif" | "pindah";

export type KategoriNama =
  | "Bayi"
  | "Batita"
  | "Balita"
  | "Remaja"
  | "WUS"
  | "PUS"
  | "Ibu Hamil"
  | "Lansia";

export interface KaderProfile {
  id: string;
  nama_kader: string;
  nama_posyandu: string;
  wilayah: string;
  email: string;
  created_at: string;
}

export interface RumahTangga {
  id: string;
  no_rumah: string;
  no_kk?: string | null; // Nomor KK (opsional)
  alamat: string;
  dusun: string;
  rt: string;
  rw: string;
  nama_kepala_keluarga: string;
  status: StatusRumahTangga;
  created_at: string;
}

export interface Individu {
  id: string;
  rumah_tangga_id: string;
  nama: string;
  nik: string;
  tanggal_lahir: string; // ISO date
  jenis_kelamin: JenisKelamin;
  peran_dalam_kk: PeranKK;
  status_kb: StatusKB;
  status_hamil: boolean;
  perkiraan_tgl_lahir?: string | null;
  pasangan_id?: string | null;
  status: StatusIndividu;
  created_at: string;
  // snapshot kategori yang sudah dikonfirmasi kader
  kategori_terkonfirmasi?: KategoriNama | null;
  // Dihitung di DB (view v_individuals via fungsi Postgres). Undefined pada
  // baris hasil insert/update langsung — fallback ke perhitungan klien.
  usia_bulan?: number;
  kategori_utama?: KategoriNama;
  kategori_semua?: KategoriNama[];
}

export interface KategoriResult {
  kategori_utama: KategoriNama;
  semua_kategori: KategoriNama[];
}

export interface Review {
  individu_id: string;
  nama: string;
  usia_display: string;
  kategori_lama: KategoriNama | null;
  kategori_baru: KategoriNama;
}

export interface Laporan {
  id: string;
  judul: string;
  kategori: KategoriNama | "Semua";
  jumlah_data: number;
  created_at: string;
  periode: string;
}
