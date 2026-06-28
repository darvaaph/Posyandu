"use client";

import { useMemo } from "react";
import { useSyncExternalStore } from "react";
import { store, type Database } from "@/lib/store";

/** Subscribe to the whole database cache (re-renders on any mutation). */
export function useDatabase(): Database {
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );
}

export function useHouseholds() {
  return useDatabase().households;
}

export function useIndividuals(rumahTanggaId?: string) {
  const db = useDatabase();
  // useMemo mencegah re-filter saat bagian lain cache berubah (mis. households update).
  return useMemo(
    () =>
      rumahTanggaId
        ? db.individuals.filter((i) => i.rumah_tangga_id === rumahTanggaId)
        : db.individuals,
    [db.individuals, rumahTanggaId]
  );
}

export function useReports() {
  return useDatabase().reports;
}
