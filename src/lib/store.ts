// Supabase-backed data layer with an in-memory cache + pub/sub so the existing
// useSyncExternalStore hooks keep working unchanged. Mutations are async (they
// write to Supabase, then update the cache and notify subscribers).

import { supabase } from "./supabase";
import type {
  Individu,
  KaderProfile,
  Laporan,
  RumahTangga,
} from "./types";

export interface Database {
  kader: KaderProfile | null;
  households: RumahTangga[];
  individuals: Individu[];
  reports: Laporan[];
  loaded: boolean;
}

const EMPTY: Database = {
  kader: null,
  households: [],
  individuals: [],
  reports: [],
  loaded: false,
};

let cache: Database = { ...EMPTY };
const listeners = new Set<() => void>();

let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;
let reloadTimer: ReturnType<typeof setTimeout> | null = null;

/** Reload data dengan debounce 250ms agar burst event (mis. seeding) hanya 1x fetch. */
function scheduleReload() {
  if (reloadTimer) clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => {
    reloadTimer = null;
    store.loadAll().catch((e) => console.error("[realtime] reload gagal", e));
  }, 250);
}

function emit() {
  // ganti referensi agar useSyncExternalStore mendeteksi perubahan
  cache = { ...cache };
  listeners.forEach((l) => l());
}

// ---------- Row <-> domain mapping ----------

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapKader(r: any): KaderProfile {
  return {
    id: r.id,
    nama_kader: r.nama_kader,
    nama_posyandu: r.nama_posyandu,
    wilayah: r.wilayah,
    email: r.email,
    created_at: r.created_at,
  };
}

function mapHousehold(r: any): RumahTangga {
  return {
    id: r.id,
    no_rumah: r.no_rumah,
    alamat: r.alamat,
    dusun: r.dusun ?? "",
    rt: r.rt ?? "",
    rw: r.rw ?? "",
    nama_kepala_keluarga: r.nama_kepala_keluarga,
    status: r.status,
    created_at: r.created_at,
  };
}

function mapIndividu(r: any): Individu {
  return {
    id: r.id,
    rumah_tangga_id: r.household_id,
    nama: r.nama,
    nik: r.nik,
    tanggal_lahir: r.tanggal_lahir,
    jenis_kelamin: r.jenis_kelamin,
    peran_dalam_kk: r.peran_dalam_kk,
    status_kb: r.status_kb ?? "tidak",
    status_hamil: r.status_hamil ?? false,
    perkiraan_tgl_lahir: r.perkiraan_tgl_lahir,
    pasangan_id: r.pasangan_id,
    status: r.status,
    created_at: r.created_at,
    kategori_terkonfirmasi: r.kategori_terkonfirmasi,
    // hanya ada bila baris berasal dari view v_individuals
    usia_bulan: r.usia_bulan ?? undefined,
    kategori_utama: r.kategori_utama ?? undefined,
    kategori_semua: r.kategori_semua ?? undefined,
  };
}

function mapReport(r: any): Laporan {
  return {
    id: r.id,
    judul: r.judul,
    kategori: r.kategori,
    jumlah_data: r.jumlah_data,
    periode: r.periode,
    created_at: r.created_at,
  };
}

function individuToRow(data: Partial<Individu>) {
  const row: Record<string, unknown> = {};
  if (data.rumah_tangga_id !== undefined) row.household_id = data.rumah_tangga_id;
  if (data.nama !== undefined) row.nama = data.nama;
  if (data.nik !== undefined) row.nik = data.nik;
  if (data.tanggal_lahir !== undefined) row.tanggal_lahir = data.tanggal_lahir;
  if (data.jenis_kelamin !== undefined) row.jenis_kelamin = data.jenis_kelamin;
  if (data.peran_dalam_kk !== undefined) row.peran_dalam_kk = data.peran_dalam_kk;
  if (data.status_kb !== undefined) row.status_kb = data.status_kb;
  if (data.status_hamil !== undefined) row.status_hamil = data.status_hamil;
  if (data.perkiraan_tgl_lahir !== undefined)
    row.perkiraan_tgl_lahir = data.perkiraan_tgl_lahir || null;
  if (data.pasangan_id !== undefined) row.pasangan_id = data.pasangan_id || null;
  if (data.status !== undefined) row.status = data.status;
  if (data.kategori_terkonfirmasi !== undefined)
    row.kategori_terkonfirmasi = data.kategori_terkonfirmasi;
  return row;
}

// ---------- Store API ----------

export const store = {
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  getSnapshot(): Database {
    return cache;
  },

  getServerSnapshot(): Database {
    return EMPTY;
  },

  setKader(kader: KaderProfile | null) {
    cache.kader = kader;
    emit();
  },

  clear() {
    cache = { ...EMPTY };
    emit();
  },

  /** Muat seluruh data milik kader (RLS membatasi ke data sendiri). */
  async loadAll() {
    // Individu dibaca dari view v_individuals (kategori dihitung di DB).
    // Bila view belum dibuat (SQL belum dijalankan), fallback ke tabel dasar.
    let indRes = await supabase
      .from("v_individuals")
      .select("*")
      .order("created_at");
    if (indRes.error) {
      indRes = await supabase.from("individuals").select("*").order("created_at");
    }

    const [households, reports] = await Promise.all([
      supabase.from("households").select("*").order("created_at"),
      supabase.from("reports").select("*").order("created_at", { ascending: false }),
    ]);

    if (households.error) throw households.error;
    if (indRes.error) throw indRes.error;
    if (reports.error) throw reports.error;

    cache.households = (households.data ?? []).map(mapHousehold);
    cache.individuals = (indRes.data ?? []).map(mapIndividu);
    cache.reports = (reports.data ?? []).map(mapReport);
    cache.loaded = true;
    emit();
  },

  // ---- Realtime ----

  /** Mulai berlangganan perubahan DB; setiap perubahan memicu reload (debounced). */
  startRealtime() {
    if (realtimeChannel) return;
    realtimeChannel = supabase
      .channel("db-posyandu")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "households" },
        scheduleReload
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "individuals" },
        scheduleReload
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reports" },
        scheduleReload
      )
      .subscribe();
  },

  stopRealtime() {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }
    if (reloadTimer) {
      clearTimeout(reloadTimer);
      reloadTimer = null;
    }
  },

  // ---- Kader ----
  async updateKader(patch: Partial<KaderProfile>): Promise<KaderProfile> {
    if (!cache.kader) throw new Error("Belum login");
    const { data, error } = await supabase
      .from("kader_profiles")
      .update({
        nama_kader: patch.nama_kader,
        nama_posyandu: patch.nama_posyandu,
        wilayah: patch.wilayah,
        email: patch.email,
      })
      .eq("id", cache.kader.id)
      .select()
      .single();
    if (error) throw error;
    cache.kader = mapKader(data);
    emit();
    return cache.kader;
  },

  // ---- Households ----
  async addHousehold(
    data: Omit<RumahTangga, "id" | "created_at">
  ): Promise<RumahTangga> {
    if (!cache.kader) throw new Error("Belum login");
    const { data: row, error } = await supabase
      .from("households")
      .insert({ ...data, kader_id: cache.kader.id })
      .select()
      .single();
    if (error) throw error;
    const rt = mapHousehold(row);
    cache.households = [...cache.households, rt];
    emit();
    return rt;
  },

  async updateHousehold(id: string, patch: Partial<RumahTangga>) {
    const { data, error } = await supabase
      .from("households")
      .update({
        no_rumah: patch.no_rumah,
        alamat: patch.alamat,
        dusun: patch.dusun,
        rt: patch.rt,
        rw: patch.rw,
        nama_kepala_keluarga: patch.nama_kepala_keluarga,
        status: patch.status,
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    cache.households = cache.households.map((h) =>
      h.id === id ? mapHousehold(data) : h
    );
    emit();
  },

  async deleteHousehold(id: string) {
    const { error } = await supabase.from("households").delete().eq("id", id);
    if (error) throw error;
    cache.households = cache.households.filter((h) => h.id !== id);
    cache.individuals = cache.individuals.filter((i) => i.rumah_tangga_id !== id);
    emit();
  },

  noRumahExists(no_rumah: string, exceptId?: string): boolean {
    return cache.households.some(
      (h) => h.no_rumah === no_rumah && h.id !== exceptId
    );
  },

  // ---- Individuals ----
  async addIndividual(
    data: Omit<Individu, "id" | "created_at">
  ): Promise<Individu> {
    const { data: row, error } = await supabase
      .from("individuals")
      .insert(individuToRow(data))
      .select()
      .single();
    if (error) throw error;
    const ind = mapIndividu(row);
    cache.individuals = [...cache.individuals, ind];
    emit();
    return ind;
  },

  async updateIndividual(id: string, patch: Partial<Individu>) {
    const { data, error } = await supabase
      .from("individuals")
      .update(individuToRow(patch))
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    cache.individuals = cache.individuals.map((i) =>
      i.id === id ? mapIndividu(data) : i
    );
    emit();
  },

  async deleteIndividual(id: string) {
    const { error } = await supabase.from("individuals").delete().eq("id", id);
    if (error) throw error;
    cache.individuals = cache.individuals.filter((i) => i.id !== id);
    emit();
  },

  nikExists(nik: string, exceptId?: string): Individu | undefined {
    return cache.individuals.find((i) => i.nik === nik && i.id !== exceptId);
  },

  // ---- Reports ----
  async addReport(data: Omit<Laporan, "id" | "created_at">): Promise<Laporan> {
    if (!cache.kader) throw new Error("Belum login");
    const { data: row, error } = await supabase
      .from("reports")
      .insert({
        kader_id: cache.kader.id,
        judul: data.judul,
        kategori: data.kategori,
        jumlah_data: data.jumlah_data,
        periode: data.periode,
      })
      .select()
      .single();
    if (error) throw error;
    const rep = mapReport(row);
    cache.reports = [rep, ...cache.reports];
    emit();
    return rep;
  },

  async deleteReport(id: string) {
    const { error } = await supabase.from("reports").delete().eq("id", id);
    if (error) throw error;
    cache.reports = cache.reports.filter((r) => r.id !== id);
    emit();
  },

  // ---- Dev helpers (seed / reset). Hanya dipanggil dari UI yang di-gate dev. ----

  /** Hapus SEMUA data milik kader yang sedang login (jadi 0). */
  async clearAllData() {
    if (!cache.kader) throw new Error("Belum login");
    const rep = await supabase
      .from("reports")
      .delete()
      .eq("kader_id", cache.kader.id);
    if (rep.error) throw rep.error;
    // individuals ikut terhapus via ON DELETE CASCADE dari households
    const hh = await supabase
      .from("households")
      .delete()
      .eq("kader_id", cache.kader.id);
    if (hh.error) throw hh.error;
    cache.households = [];
    cache.individuals = [];
    cache.reports = [];
    emit();
  },

  /** Isi data contoh (2 rumah tangga + 7 warga) ke akun kader saat ini. */
  async seedSampleData() {
    if (!cache.kader) throw new Error("Belum login");

    const rt1 = await this.addHousehold({
      no_rumah: "001",
      alamat: "Jl. Melati No. 12",
      dusun: "Dusun Krajan",
      rt: "002",
      rw: "001",
      nama_kepala_keluarga: "Budi Santoso",
      status: "aktif",
    });
    const rt2 = await this.addHousehold({
      no_rumah: "002",
      alamat: "Jl. Mawar No. 5",
      dusun: "Dusun Krajan",
      rt: "002",
      rw: "001",
      nama_kepala_keluarga: "Slamet Riyadi",
      status: "aktif",
    });

    const budi = await this.addIndividual({
      rumah_tangga_id: rt1.id,
      nama: "Budi Santoso",
      nik: "3201010101800001",
      tanggal_lahir: isoYearsAgo(45),
      jenis_kelamin: "L",
      peran_dalam_kk: "kepala_keluarga",
      status_kb: "tidak",
      status_hamil: false,
      status: "aktif",
    });
    await this.addIndividual({
      rumah_tangga_id: rt1.id,
      nama: "Siti Aminah",
      nik: "3201014104850002",
      tanggal_lahir: isoYearsAgo(32),
      jenis_kelamin: "P",
      peran_dalam_kk: "istri",
      status_kb: "suntik",
      status_hamil: true,
      perkiraan_tgl_lahir: isoYearsAgo(0, -3),
      pasangan_id: budi.id,
      status: "aktif",
    });
    await this.addIndividual({
      rumah_tangga_id: rt1.id,
      nama: "Putri Santoso",
      nik: "3201014104230003",
      tanggal_lahir: isoYearsAgo(2, 4),
      jenis_kelamin: "P",
      peran_dalam_kk: "anak",
      status_kb: "tidak",
      status_hamil: false,
      status: "aktif",
    });
    await this.addIndividual({
      rumah_tangga_id: rt1.id,
      nama: "Adi Santoso",
      nik: "3201010101100004",
      tanggal_lahir: isoYearsAgo(14),
      jenis_kelamin: "L",
      peran_dalam_kk: "anak",
      status_kb: "tidak",
      status_hamil: false,
      status: "aktif",
    });

    const slamet = await this.addIndividual({
      rumah_tangga_id: rt2.id,
      nama: "Slamet Riyadi",
      nik: "3201010101620005",
      tanggal_lahir: isoYearsAgo(63),
      jenis_kelamin: "L",
      peran_dalam_kk: "kepala_keluarga",
      status_kb: "tidak",
      status_hamil: false,
      status: "aktif",
    });
    await this.addIndividual({
      rumah_tangga_id: rt2.id,
      nama: "Wati Lestari",
      nik: "3201014104900006",
      tanggal_lahir: isoYearsAgo(28),
      jenis_kelamin: "P",
      peran_dalam_kk: "istri",
      status_kb: "pil",
      status_hamil: false,
      pasangan_id: slamet.id,
      status: "aktif",
    });
    await this.addIndividual({
      rumah_tangga_id: rt2.id,
      nama: "Bayu Lestari",
      nik: "3201010101250007",
      tanggal_lahir: isoYearsAgo(0, 7),
      jenis_kelamin: "L",
      peran_dalam_kk: "anak",
      status_kb: "tidak",
      status_hamil: false,
      status: "aktif",
    });
  },
};

/** Tanggal ISO (YYYY-MM-DD) sekian tahun & bulan yang lalu — untuk seed. */
function isoYearsAgo(years: number, extraMonths = 0): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  d.setMonth(d.getMonth() - extraMonths);
  return d.toISOString().slice(0, 10);
}

export { mapKader };
