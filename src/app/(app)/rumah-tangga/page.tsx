"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, ChevronRight, Home } from "lucide-react";
import { useDatabase } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchBar, EmptyState } from "@/components/common/Common";

export default function RumahTanggaPage() {
  const db = useDatabase();
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const term = q.toLowerCase().trim();
    return db.households.filter(
      (h) =>
        !term ||
        h.nama_kepala_keluarga.toLowerCase().includes(term) ||
        h.no_rumah.toLowerCase().includes(term) ||
        h.alamat.toLowerCase().includes(term)
    );
  }, [db.households, q]);

  const countAnggota = (rtId: string) =>
    db.individuals.filter((i) => i.rumah_tangga_id === rtId).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Data Warga</h1>
          <p className="text-sm text-muted-foreground">
            {db.households.length} rumah tangga terdaftar
          </p>
        </div>
        <Link href="/rumah-tangga/tambah">
          <Button size="sm">
            <Plus className="h-4 w-4" /> Tambah
          </Button>
        </Link>
      </div>

      <SearchBar value={q} onChange={setQ} placeholder="Cari kepala keluarga / no rumah..." />

      {list.length === 0 ? (
        <EmptyState
          title="Belum ada rumah tangga"
          description="Tambahkan rumah tangga pertama untuk mulai mencatat warga."
          action={
            <Link href="/rumah-tangga/tambah">
              <Button size="sm">
                <Plus className="h-4 w-4" /> Tambah Rumah Tangga
              </Button>
            </Link>
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
                  </p>
                </div>
                <Badge className="bg-accent text-accent-foreground">
                  {countAnggota(h.id)} anggota
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
