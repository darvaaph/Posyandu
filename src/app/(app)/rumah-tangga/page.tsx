"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, ChevronRight, X } from "lucide-react";
import { useDatabase } from "@/hooks/useData";
import { kategoriIndividu } from "@/lib/kategorisasi";
import { KATEGORI_META } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SearchBar, EmptyState } from "@/components/common/Common";
import type { KategoriNama } from "@/lib/types";

export default function RumahTanggaPage() {
  const db = useDatabase();
  const [q, setQ] = useState("");
  const [filterDesa, setFilterDesa] = useState("");
  const [filterRT, setFilterRT] = useState("");

  // Precompute per-household: jumlah anggota, kategori, perlu tinjau
  const householdMeta = useMemo(() => {
    const map = new Map<string, { count: number; kategori: KategoriNama[]; needsReview: boolean }>();
    for (const ind of db.individuals) {
      if (!map.has(ind.rumah_tangga_id)) {
        map.set(ind.rumah_tangga_id, { count: 0, kategori: [], needsReview: false });
      }
      const entry = map.get(ind.rumah_tangga_id)!;
      entry.count++;
      if (ind.status === "aktif") {
        const { kategori_utama } = kategoriIndividu(ind);
        if (kategori_utama && !entry.kategori.includes(kategori_utama)) {
          entry.kategori.push(kategori_utama);
        }
        const lama = ind.kategori_terkonfirmasi ?? null;
        if (kategori_utama !== lama && !(!lama && !kategori_utama)) {
          entry.needsReview = true;
        }
      }
    }
    return map;
  }, [db.individuals]);

  const desaList = useMemo(
    () => [...new Set(db.households.map((h) => h.dusun).filter(Boolean))].sort(),
    [db.households]
  );

  const rtList = useMemo(() => {
    const base = filterDesa
      ? db.households.filter((h) => h.dusun === filterDesa)
      : db.households;
    return [...new Set(base.map((h) => h.rt).filter(Boolean))].sort();
  }, [db.households, filterDesa]);

  const totalWarga = useMemo(
    () => db.individuals.filter((i) => i.status === "aktif").length,
    [db.individuals]
  );

  const list = useMemo(() => {
    const term = q.toLowerCase().trim();
    return db.households.filter((h) => {
      if (term &&
        !h.nama_kepala_keluarga.toLowerCase().includes(term) &&
        !h.no_rumah.toLowerCase().includes(term) &&
        !h.alamat.toLowerCase().includes(term)) return false;
      if (filterDesa && h.dusun !== filterDesa) return false;
      if (filterRT && h.rt !== filterRT) return false;
      return true;
    });
  }, [db.households, q, filterDesa, filterRT]);

  const hasFilter = !!(filterDesa || filterRT);

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Data Warga</h1>
          <p className="text-sm text-muted-foreground">
            {totalWarga} warga · {db.households.length} KK
          </p>
        </div>
        <Link href="/rumah-tangga/tambah">
          <Button size="sm">
            <Plus className="h-4 w-4" /> Tambah
          </Button>
        </Link>
      </div>

      <SearchBar value={q} onChange={setQ} placeholder="Cari nama, no. rumah, atau alamat..." />

      {/* Filter desa + RT */}
      {(desaList.length > 1 || rtList.length > 1) && (
        <div className="space-y-2">
          {desaList.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {desaList.map((desa) => (
                <button
                  key={desa}
                  onClick={() => {
                    if (filterDesa === desa) { setFilterDesa(""); setFilterRT(""); }
                    else { setFilterDesa(desa); setFilterRT(""); }
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    filterDesa === desa
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  {desa}
                </button>
              ))}
            </div>
          )}
          {rtList.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">RT:</span>
              {rtList.map((rt) => (
                <button
                  key={rt}
                  onClick={() => setFilterRT(filterRT === rt ? "" : rt)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    filterRT === rt
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  RT {rt}
                </button>
              ))}
            </div>
          )}
          {hasFilter && (
            <button
              onClick={() => { setFilterDesa(""); setFilterRT(""); }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" /> Hapus filter
            </button>
          )}
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState
          title={hasFilter || q ? "Tidak ada hasil" : "Belum ada rumah tangga"}
          description={
            hasFilter || q
              ? "Coba ubah kata kunci atau filter."
              : "Tambahkan rumah tangga pertama untuk mulai mencatat warga."
          }
          action={
            !hasFilter && !q ? (
              <Link href="/rumah-tangga/tambah">
                <Button size="sm"><Plus className="h-4 w-4" /> Tambah Rumah Tangga</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          {list.map((h) => {
            const meta = householdMeta.get(h.id);
            const cats = meta?.kategori ?? [];
            const shown = cats.slice(0, 2);
            const extra = cats.length - 2;
            const noRumah = h.no_rumah.replace(/^0+/, "") || h.no_rumah;
            const lokasi = [
              h.dusun,
              h.rt && h.rw ? `RT ${h.rt}/${h.rw}` : h.rt ? `RT ${h.rt}` : "",
            ].filter(Boolean).join(" · ");

            return (
              <Link key={h.id} href={`/rumah-tangga/${h.id}`}>
                <Card className="flex items-center gap-3 p-3.5 transition hover:border-primary hover:shadow-sm">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                    {noRumah}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate font-semibold leading-tight">KK {h.nama_kepala_keluarga}</p>
                    {lokasi && (
                      <p className="truncate text-xs text-muted-foreground">{lokasi}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-xs text-muted-foreground">{meta?.count ?? 0} anggota</span>
                      {shown.map((k) => (
                        <span key={k} className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${KATEGORI_META[k].color}`}>
                          {KATEGORI_META[k].icon} {k}
                        </span>
                      ))}
                      {extra > 0 && (
                        <span className="text-[10px] text-muted-foreground">+{extra}</span>
                      )}
                      {meta?.needsReview && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                          ⚠️ Tinjau
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
