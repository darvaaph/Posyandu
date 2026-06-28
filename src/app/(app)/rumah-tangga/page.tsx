"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, ChevronRight, Home, X } from "lucide-react";
import { useDatabase } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchBar, EmptyState } from "@/components/common/Common";

export default function RumahTanggaPage() {
  const db = useDatabase();
  const [q, setQ] = useState("");
  const [filterDesa, setFilterDesa] = useState("");
  const [filterRT, setFilterRT] = useState("");

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

  const list = useMemo(() => {
    const term = q.toLowerCase().trim();
    return db.households.filter((h) => {
      const matchSearch =
        !term ||
        h.nama_kepala_keluarga.toLowerCase().includes(term) ||
        h.no_rumah.toLowerCase().includes(term) ||
        h.alamat.toLowerCase().includes(term);
      const matchDesa = !filterDesa || h.dusun === filterDesa;
      const matchRT = !filterRT || h.rt === filterRT;
      return matchSearch && matchDesa && matchRT;
    });
  }, [db.households, q, filterDesa, filterRT]);

  // Hitung jumlah anggota per RT dalam satu pass (O(n)) bukan per-kartu (O(n²)).
  const countMap = useMemo(() => {
    const m: Record<string, number> = {};
    for (const i of db.individuals) {
      m[i.rumah_tangga_id] = (m[i.rumah_tangga_id] ?? 0) + 1;
    }
    return m;
  }, [db.individuals]);

  const hasFilter = filterDesa || filterRT;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Data Warga</h1>
          <p className="text-sm text-muted-foreground">
            {list.length !== db.households.length
              ? `${list.length} dari ${db.households.length} rumah tangga`
              : `${db.households.length} rumah tangga terdaftar`}
          </p>
        </div>
        <Link href="/rumah-tangga/tambah">
          <Button size="sm">
            <Plus className="h-4 w-4" /> Tambah
          </Button>
        </Link>
      </div>

      <SearchBar value={q} onChange={setQ} placeholder="Cari kepala keluarga / no rumah..." />

      {/* Filter chips */}
      {(desaList.length > 1 || rtList.length > 1) && (
        <div className="space-y-2">
          {desaList.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {desaList.map((desa) => (
                <button
                  key={desa}
                  onClick={() => {
                    if (filterDesa === desa) {
                      setFilterDesa("");
                      setFilterRT("");
                    } else {
                      setFilterDesa(desa);
                      setFilterRT("");
                    }
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
            <div className="flex flex-wrap gap-1.5">
              <span className="self-center text-xs text-muted-foreground">RT:</span>
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
                <Button size="sm">
                  <Plus className="h-4 w-4" /> Tambah Rumah Tangga
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          {list.map((h) => (
            <Link key={h.id} href={`/rumah-tangga/${h.id}`}>
              <Card className="flex items-center gap-3 p-4 transition hover:border-primary">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Home className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{h.nama_kepala_keluarga}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    No. {h.no_rumah} · {h.alamat}
                    {h.dusun && ` · ${h.dusun}`}
                  </p>
                </div>
                <Badge className="bg-accent text-accent-foreground">
                  {countMap[h.id] ?? 0} anggota
                </Badge>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
