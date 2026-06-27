"use client";

import { useDatabase } from "./useData";
import { kategoriIndividu } from "@/lib/kategorisasi";
import { usiaDisplay } from "@/lib/date";
import type { Review } from "@/lib/types";

/**
 * Tinjauan bulanan: warga aktif yang kategori terkininya berbeda dari
 * kategori yang terakhir dikonfirmasi kader (atau belum pernah dikonfirmasi).
 */
export function useReviews(): Review[] {
  const db = useDatabase();

  return db.individuals
    .filter((i) => i.status === "aktif")
    .map((ind) => {
      const { kategori_utama } = kategoriIndividu(ind);
      const lama = ind.kategori_terkonfirmasi ?? null;
      if (lama === kategori_utama) return null;
      return {
        individu_id: ind.id,
        nama: ind.nama,
        usia_display: usiaDisplay(ind.tanggal_lahir),
        kategori_lama: lama,
        kategori_baru: kategori_utama,
      } as Review;
    })
    .filter((r): r is Review => r !== null);
}
