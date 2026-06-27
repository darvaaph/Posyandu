// Date helpers (no external dependency)

export interface Usia {
  tahun: number;
  bulan: number;
  totalBulan: number;
}

/** Hitung usia dari tanggal lahir hingga `ref` (default: sekarang). */
export function hitungUsia(tanggalLahir: string | Date, ref: Date = new Date()): Usia {
  const lahir = typeof tanggalLahir === "string" ? new Date(tanggalLahir) : tanggalLahir;

  let tahun = ref.getFullYear() - lahir.getFullYear();
  let bulan = ref.getMonth() - lahir.getMonth();

  if (ref.getDate() < lahir.getDate()) {
    bulan -= 1;
  }
  if (bulan < 0) {
    tahun -= 1;
    bulan += 12;
  }

  const totalBulan = tahun * 12 + bulan;
  return { tahun, bulan, totalBulan };
}

export function usiaDisplay(tanggalLahir: string | Date): string {
  const { tahun, bulan } = hitungUsia(tanggalLahir);
  if (tahun <= 0) return `${bulan} bulan`;
  if (bulan === 0) return `${tahun} tahun`;
  return `${tahun} tahun ${bulan} bulan`;
}

const BULAN_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function formatTanggal(value?: string | Date | null): string {
  if (!value) return "-";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "-";
  return `${d.getDate()} ${BULAN_ID[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatTanggalWaktu(value?: string | Date | null): string {
  if (!value) return "-";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "-";
  const jam = String(d.getHours()).padStart(2, "0");
  const menit = String(d.getMinutes()).padStart(2, "0");
  return `${formatTanggal(d)}, ${jam}:${menit}`;
}

export function periodeSekarang(): string {
  const d = new Date();
  return `${BULAN_ID[d.getMonth()]} ${d.getFullYear()}`;
}
