import type { KategoriNama, PeranKK, StatusKB } from "./types";

export const APP_NAME = "REKAP Posyandu";

export const KATEGORI_META: Record<
  KategoriNama,
  { icon: string; deskripsi: string; color: string }
> = {
  Bayi: { icon: "👶", deskripsi: "0 – 11 bulan", color: "bg-pink-100 text-pink-700" },
  Batita: { icon: "🚶", deskripsi: "1 – 2 tahun", color: "bg-orange-100 text-orange-700" },
  Balita: { icon: "🧒", deskripsi: "3 – 4 tahun", color: "bg-amber-100 text-amber-700" },
  Remaja: { icon: "👦", deskripsi: "10 – 18 tahun", color: "bg-sky-100 text-sky-700" },
  WUS: { icon: "👩", deskripsi: "Wanita Usia Subur (15 – 49 th)", color: "bg-fuchsia-100 text-fuchsia-700" },
  PUS: { icon: "👫", deskripsi: "Pasangan Usia Subur", color: "bg-violet-100 text-violet-700" },
  "Ibu Hamil": { icon: "🤰", deskripsi: "Sedang hamil", color: "bg-rose-100 text-rose-700" },
  Lansia: { icon: "👴", deskripsi: "60 tahun ke atas", color: "bg-slate-100 text-slate-700" },
};

export const KATEGORI_LIST: KategoriNama[] = [
  "Bayi",
  "Batita",
  "Balita",
  "Remaja",
  "WUS",
  "PUS",
  "Ibu Hamil",
  "Lansia",
];

export const PERAN_KK_OPTIONS: { value: PeranKK; label: string }[] = [
  { value: "kepala_keluarga", label: "Kepala Keluarga" },
  { value: "istri", label: "Istri" },
  { value: "anak", label: "Anak" },
  { value: "anggota_lain", label: "Anggota Lain" },
];

export const STATUS_KB_OPTIONS: { value: StatusKB; label: string }[] = [
  { value: "tidak", label: "Tidak ber-KB" },
  { value: "pil", label: "Pil" },
  { value: "suntik", label: "Suntik" },
  { value: "iud", label: "IUD" },
  { value: "implan", label: "Implan" },
  { value: "lainnya", label: "Lainnya" },
];
