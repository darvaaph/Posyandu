import { hitungUsia } from "./date";
import type {
  Individu,
  JenisKelamin,
  KategoriNama,
  KategoriResult,
} from "./types";

/**
 * Menentukan kategori Posyandu untuk seorang individu.
 *
 * Seseorang bisa masuk ke beberapa kategori sekaligus (mis. seorang wanita
 * bisa WUS + Ibu Hamil + PUS). `kategori_utama` adalah kategori dengan
 * prioritas tertinggi untuk ditampilkan sebagai label utama.
 *
 * Cerminan dari logika backend `tentukan_kategori()`.
 */
export function tentukanKategori(params: {
  tanggal_lahir: string | Date;
  jenis_kelamin: JenisKelamin;
  status_hamil?: boolean;
  punya_pasangan?: boolean; // pasangan_id terisi
}): KategoriResult {
  const { tanggal_lahir, jenis_kelamin, status_hamil, punya_pasangan } = params;
  const { totalBulan, tahun } = hitungUsia(tanggal_lahir);

  const kategori: KategoriNama[] = [];

  // Kelompok usia anak (berbasis bulan)
  if (totalBulan < 12) {
    kategori.push("Bayi");
  } else if (totalBulan < 36) {
    kategori.push("Batita");
  } else if (totalBulan < 60) {
    kategori.push("Balita");
  }

  // Remaja 10–18 tahun
  if (tahun >= 10 && tahun <= 18) {
    kategori.push("Remaja");
  }

  // Lansia 60+
  if (tahun >= 60) {
    kategori.push("Lansia");
  }

  // Wanita Usia Subur 15–49 tahun
  const isWUS = jenis_kelamin === "P" && tahun >= 15 && tahun <= 49;
  if (isWUS) {
    kategori.push("WUS");

    if (status_hamil) {
      kategori.push("Ibu Hamil");
    }
  }

  // PUS: Pasangan Usia Subur — siapa pun (suami/istri) yang memiliki pasangan
  // dan berusia subur 15–49. Suami masuk PUS tapi TIDAK masuk WUS.
  if (punya_pasangan && tahun >= 15 && tahun <= 49) {
    kategori.push("PUS");
  }

  // Tentukan kategori utama berdasarkan prioritas
  const prioritas: KategoriNama[] = [
    "Ibu Hamil",
    "Bayi",
    "Batita",
    "Balita",
    "PUS",
    "WUS",
    "Remaja",
    "Lansia",
  ];

  let utama: KategoriNama | undefined;
  for (const p of prioritas) {
    if (kategori.includes(p)) {
      utama = p;
      break;
    }
  }

  // Warga dewasa di luar sasaran (pria 19-59, anak 5-9) tidak punya label Posyandu.
  return {
    kategori_utama: utama,
    semua_kategori: kategori,
  };
}

/**
 * Versi yang menerima sebuah objek Individu lengkap.
 * Memakai hasil hitungan DB (view v_individuals) bila tersedia, agar konsisten
 * dengan sumber kebenaran di Postgres; jatuh ke perhitungan klien bila tidak.
 */
export function kategoriIndividu(ind: Individu): KategoriResult {
  if (ind.kategori_utama && ind.kategori_semua && ind.kategori_semua.length) {
    return {
      kategori_utama: ind.kategori_utama,
      semua_kategori: ind.kategori_semua,
    };
  }
  return tentukanKategori({
    tanggal_lahir: ind.tanggal_lahir,
    jenis_kelamin: ind.jenis_kelamin,
    status_hamil: ind.status_hamil,
    punya_pasangan: Boolean(ind.pasangan_id),
  });
}

/** Apakah individu termasuk dalam sebuah kategori (untuk filter & hitung). */
export function termasukKategori(ind: Individu, nama: KategoriNama): boolean {
  if (ind.status !== "aktif") return false;
  return kategoriIndividu(ind).semua_kategori.includes(nama);
}
