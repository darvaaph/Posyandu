"use client";

import { useSyncExternalStore } from "react";
import { store, type Database } from "@/lib/store";

const EMPTY: Database = {
  kader: null,
  households: [],
  individuals: [],
  reports: [],
};

/** Subscribe to the whole mock database (re-renders on any mutation). */
export function useDatabase(): Database {
  return useSyncExternalStore(
    store.subscribe,
    () => store.getSnapshot(),
    () => EMPTY // server snapshot (avoids hydration access to localStorage)
  );
}

export function useHouseholds() {
  const db = useDatabase();
  return db.households;
}

export function useIndividuals(rumahTanggaId?: string) {
  const db = useDatabase();
  return rumahTanggaId
    ? db.individuals.filter((i) => i.rumah_tangga_id === rumahTanggaId)
    : db.individuals;
}

export function useReports() {
  const db = useDatabase();
  return db.reports;
}
