"use client";

import { useMemo } from "react";
import { useDatabase } from "./useData";
import { termasukKategori } from "@/lib/kategorisasi";
import { KATEGORI_LIST } from "@/lib/constants";
import type { Individu, KategoriNama } from "@/lib/types";

export function useKategoriSummary(): Record<KategoriNama, number> {
  const db = useDatabase();
  return useMemo(() => {
    const result = {} as Record<KategoriNama, number>;
    for (const nama of KATEGORI_LIST) {
      result[nama] = db.individuals.filter((i) => termasukKategori(i, nama)).length;
    }
    return result;
  }, [db.individuals]);
}

export function useKategoriMembers(nama: KategoriNama): Individu[] {
  const db = useDatabase();
  return useMemo(
    () => db.individuals.filter((i) => termasukKategori(i, nama)),
    [db.individuals, nama]
  );
}
