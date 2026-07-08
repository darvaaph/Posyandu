"use client";

import { useDatabase } from "./useData";
import { kategoriIndividu } from "@/lib/kategorisasi";
import { usiaDisplay } from "@/lib/date";
import type { Individu, Review } from "@/lib/types";

/**
 * Tinjauan kategori: warga aktif yang kategori terkininya berbeda dari
 * kategori yang terakhir dikonfirmasi kader (atau belum pernah dikonfirmasi).
 *
 * Warga yang tidak pernah punya kategori sasaran dan masih tidak punya
 * (pria dewasa, anak 5-9 tahun) dilewati — tidak perlu ditinjau.
 */
export function useReviews(): Review[] {
  const db = useDatabase();

  // Satu pass: filter + map + filter null digabung menjadi reduce agar
  // tidak membuat array perantara yang tidak dipakai.
  return db.individuals.reduce<Review[]>((acc, ind: Individu) => {
    if (ind.status !== "aktif") return acc;

    const { kategori_utama } = kategoriIndividu(ind);
    const lama = ind.kategori_terkonfirmasi ?? null;

    if (kategori_utama === lama) return acc;       // tidak ada perubahan
    if (!lama && !kategori_utama) return acc;      // tidak pernah punya kategori

    acc.push({
      individu_id: ind.id,
      nama: ind.nama,
      usia_display: usiaDisplay(ind.tanggal_lahir),
      kategori_lama: lama,
      kategori_baru: kategori_utama,
    });
    return acc;
  }, []);
}
