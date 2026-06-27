// In-browser mock data store (localStorage). Replaces the Supabase backend
// for this frontend-only build. Exposes a tiny pub/sub so React contexts can
// re-render on change.

import { uid } from "./utils";
import type {
  Individu,
  KaderProfile,
  Laporan,
  RumahTangga,
} from "./types";

const KEY = "sigap_posyandu_db_v1";

export interface Database {
  kader: KaderProfile | null;
  households: RumahTangga[];
  individuals: Individu[];
  reports: Laporan[];
  // id individu yang sudah dikonfirmasi kategorinya (kosongkan tinjauan)
}

function tahunLalu(years: number, extraMonths = 0): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  d.setMonth(d.getMonth() - extraMonths);
  return d.toISOString().slice(0, 10);
}

function seed(): Database {
  const rt1: RumahTangga = {
    id: uid("rt_"),
    no_rumah: "001",
    alamat: "Jl. Melati No. 12",
    dusun: "Dusun Krajan",
    rt: "002",
    rw: "001",
    nama_kepala_keluarga: "Budi Santoso",
    status: "aktif",
    created_at: new Date().toISOString(),
  };
  const rt2: RumahTangga = {
    id: uid("rt_"),
    no_rumah: "002",
    alamat: "Jl. Mawar No. 5",
    dusun: "Dusun Krajan",
    rt: "002",
    rw: "001",
    nama_kepala_keluarga: "Slamet Riyadi",
    status: "aktif",
    created_at: new Date().toISOString(),
  };

  const budi: Individu = {
    id: uid("ind_"),
    rumah_tangga_id: rt1.id,
    nama: "Budi Santoso",
    nik: "3201010101800001",
    tanggal_lahir: tahunLalu(45),
    jenis_kelamin: "L",
    peran_dalam_kk: "kepala_keluarga",
    status_kb: "tidak",
    status_hamil: false,
    status: "aktif",
    created_at: new Date().toISOString(),
  };
  const siti: Individu = {
    id: uid("ind_"),
    rumah_tangga_id: rt1.id,
    nama: "Siti Aminah",
    nik: "3201014104850002",
    tanggal_lahir: tahunLalu(32),
    jenis_kelamin: "P",
    peran_dalam_kk: "istri",
    status_kb: "suntik",
    status_hamil: true,
    perkiraan_tgl_lahir: tahunLalu(0, -3),
    pasangan_id: budi.id,
    status: "aktif",
    created_at: new Date().toISOString(),
  };
  const anak1: Individu = {
    id: uid("ind_"),
    rumah_tangga_id: rt1.id,
    nama: "Putri Santoso",
    nik: "3201014104230003",
    tanggal_lahir: tahunLalu(2, 4),
    jenis_kelamin: "P",
    peran_dalam_kk: "anak",
    status_kb: "tidak",
    status_hamil: false,
    status: "aktif",
    created_at: new Date().toISOString(),
  };
  const anak2: Individu = {
    id: uid("ind_"),
    rumah_tangga_id: rt1.id,
    nama: "Adi Santoso",
    nik: "3201010101100004",
    tanggal_lahir: tahunLalu(14),
    jenis_kelamin: "L",
    peran_dalam_kk: "anak",
    status_kb: "tidak",
    status_hamil: false,
    status: "aktif",
    created_at: new Date().toISOString(),
  };

  const slamet: Individu = {
    id: uid("ind_"),
    rumah_tangga_id: rt2.id,
    nama: "Slamet Riyadi",
    nik: "3201010101620005",
    tanggal_lahir: tahunLalu(63),
    jenis_kelamin: "L",
    peran_dalam_kk: "kepala_keluarga",
    status_kb: "tidak",
    status_hamil: false,
    status: "aktif",
    created_at: new Date().toISOString(),
  };
  const wati: Individu = {
    id: uid("ind_"),
    rumah_tangga_id: rt2.id,
    nama: "Wati Lestari",
    nik: "3201014104900006",
    tanggal_lahir: tahunLalu(28),
    jenis_kelamin: "P",
    peran_dalam_kk: "istri",
    status_kb: "pil",
    status_hamil: false,
    pasangan_id: slamet.id,
    status: "aktif",
    created_at: new Date().toISOString(),
  };
  const bayi: Individu = {
    id: uid("ind_"),
    rumah_tangga_id: rt2.id,
    nama: "Bayu Lestari",
    nik: "3201010101250007",
    tanggal_lahir: tahunLalu(0, 7),
    jenis_kelamin: "L",
    peran_dalam_kk: "anak",
    status_kb: "tidak",
    status_hamil: false,
    status: "aktif",
    created_at: new Date().toISOString(),
  };

  return {
    kader: null,
    households: [rt1, rt2],
    individuals: [budi, siti, anak1, anak2, slamet, wati, bayi],
    reports: [],
  };
}

let cache: Database | null = null;
const listeners = new Set<() => void>();

function isBrowser() {
  return typeof window !== "undefined";
}

function read(): Database {
  if (cache) return cache;
  if (!isBrowser()) {
    cache = seed();
    return cache;
  }
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      cache = JSON.parse(raw) as Database;
    } else {
      cache = seed();
      persist();
    }
  } catch {
    cache = seed();
  }
  return cache!;
}

function persist() {
  if (!isBrowser() || !cache) return;
  window.localStorage.setItem(KEY, JSON.stringify(cache));
}

function emit() {
  listeners.forEach((l) => l());
}

export const store = {
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  getSnapshot(): Database {
    return read();
  },

  // ---- Kader ----
  setKader(kader: KaderProfile | null) {
    const db = read();
    db.kader = kader;
    persist();
    emit();
  },

  updateKader(patch: Partial<KaderProfile>) {
    const db = read();
    if (db.kader) {
      db.kader = { ...db.kader, ...patch };
      persist();
      emit();
    }
  },

  // ---- Households ----
  addHousehold(data: Omit<RumahTangga, "id" | "created_at">): RumahTangga {
    const db = read();
    const rt: RumahTangga = {
      ...data,
      id: uid("rt_"),
      created_at: new Date().toISOString(),
    };
    db.households.push(rt);
    persist();
    emit();
    return rt;
  },

  updateHousehold(id: string, patch: Partial<RumahTangga>) {
    const db = read();
    db.households = db.households.map((h) =>
      h.id === id ? { ...h, ...patch } : h
    );
    persist();
    emit();
  },

  deleteHousehold(id: string) {
    const db = read();
    db.households = db.households.filter((h) => h.id !== id);
    db.individuals = db.individuals.filter((i) => i.rumah_tangga_id !== id);
    persist();
    emit();
  },

  noRumahExists(no_rumah: string, exceptId?: string): boolean {
    return read().households.some(
      (h) => h.no_rumah === no_rumah && h.id !== exceptId
    );
  },

  // ---- Individuals ----
  addIndividual(data: Omit<Individu, "id" | "created_at">): Individu {
    const db = read();
    const ind: Individu = {
      ...data,
      id: uid("ind_"),
      created_at: new Date().toISOString(),
    };
    db.individuals.push(ind);
    persist();
    emit();
    return ind;
  },

  updateIndividual(id: string, patch: Partial<Individu>) {
    const db = read();
    db.individuals = db.individuals.map((i) =>
      i.id === id ? { ...i, ...patch } : i
    );
    persist();
    emit();
  },

  deleteIndividual(id: string) {
    const db = read();
    db.individuals = db.individuals.filter((i) => i.id !== id);
    persist();
    emit();
  },

  nikExists(nik: string, exceptId?: string): Individu | undefined {
    return read().individuals.find((i) => i.nik === nik && i.id !== exceptId);
  },

  // ---- Reports ----
  addReport(data: Omit<Laporan, "id" | "created_at">): Laporan {
    const db = read();
    const r: Laporan = {
      ...data,
      id: uid("rep_"),
      created_at: new Date().toISOString(),
    };
    db.reports.unshift(r);
    persist();
    emit();
    return r;
  },

  deleteReport(id: string) {
    const db = read();
    db.reports = db.reports.filter((r) => r.id !== id);
    persist();
    emit();
  },

  resetSeed() {
    cache = seed();
    persist();
    emit();
  },
};
