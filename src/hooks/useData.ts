"use client";

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
  return rumahTanggaId
    ? db.individuals.filter((i) => i.rumah_tangga_id === rumahTanggaId)
    : db.individuals;
}

export function useReports() {
  return useDatabase().reports;
}
