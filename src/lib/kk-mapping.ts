import type { PeranKK } from "./types";
import type { KKAnggota } from "./kk-schema";

/** Petakan kolom "Hubungan dalam Keluarga" KK ke peran_dalam_kk aplikasi. */
export function mapHubungan(hubungan: string): PeranKK {
  const s = (hubungan || "").toUpperCase();
  if (s.includes("KEPALA")) return "kepala_keluarga";
  if (s.includes("ISTRI")) return "istri";
  if (s.includes("ANAK")) return "anak";
  return "anggota_lain";
}

/** Baris anggota siap-edit untuk layar review (hasil pemetaan dari KK). */
export interface ReviewAnggota {
  nama: string;
  nik: string;
  tanggal_lahir: string;
  jenis_kelamin: "L" | "P";
  peran_dalam_kk: PeranKK;
  hubungan_asli: string; // teks mentah dari KK, untuk referensi
}

export function toReviewAnggota(a: KKAnggota): ReviewAnggota {
  return {
    nama: a.nama ?? "",
    nik: a.nik ?? "",
    tanggal_lahir: a.tanggal_lahir ?? "",
    jenis_kelamin: a.jenis_kelamin === "L" ? "L" : "P",
    peran_dalam_kk: mapHubungan(a.hubungan),
    hubungan_asli: a.hubungan ?? "",
  };
}

/**
 * Validasi silang: digit 7-12 NIK = DDMMYY (DD+40 untuk perempuan).
 * Mengembalikan tanggal (YYYY-MM-DD) yang terenkode di NIK, atau null bila NIK
 * tidak 16 digit. Berguna untuk menandai ketidakcocokan dengan tanggal terbaca.
 */
export function tanggalDariNIK(nik: string): string | null {
  if (!/^\d{16}$/.test(nik)) return null;
  let dd = parseInt(nik.slice(6, 8), 10);
  const mm = parseInt(nik.slice(8, 10), 10);
  const yy = parseInt(nik.slice(10, 12), 10);
  if (dd > 40) dd -= 40; // perempuan
  if (dd < 1 || dd > 31 || mm < 1 || mm > 12) return null;
  // Tebak abad: 00-25 → 2000-an, selain itu 1900-an (heuristik sederhana)
  const tahun = yy <= 25 ? 2000 + yy : 1900 + yy;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${tahun}-${p(mm)}-${p(dd)}`;
}

/** True bila tanggal lahir terbaca TIDAK cocok dengan yang terenkode di NIK. */
export function nikTanggalTidakCocok(nik: string, tanggal_lahir: string): boolean {
  const dariNik = tanggalDariNIK(nik);
  if (!dariNik || !tanggal_lahir) return false;
  return dariNik !== tanggal_lahir;
}
