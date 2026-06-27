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
    // PUS: WUS yang memiliki pasangan
    if (punya_pasangan) {
      kategori.push("PUS");
    }
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

  // Fallback: usia dewasa di luar kelompok di atas
  if (!utama) {
    utama = tahun >= 60 ? "Lansia" : "WUS";
    if (!kategori.includes(utama) && jenis_kelamin === "P") kategori.push(utama);
  }

  return {
    kategori_utama: utama,
    semua_kategori: kategori.length ? kategori : [utama],
  };
}

/** Versi yang menerima sebuah objek Individu lengkap. */
export function kategoriIndividu(ind: Individu): KategoriResult {
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
