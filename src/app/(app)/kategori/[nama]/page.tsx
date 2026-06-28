"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, FileDown, FileText } from "lucide-react";
import { useDatabase } from "@/hooks/useData";
import { useKategoriMembers } from "@/hooks/useKategori";
import { KATEGORI_META, KATEGORI_LIST, STATUS_KB_OPTIONS } from "@/lib/constants";
import { usiaDisplay, formatTanggal } from "@/lib/date";
import { exportCSV, exportPDF } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SearchBar, EmptyState } from "@/components/common/Common";
import type { Individu, KategoriNama } from "@/lib/types";

export default function KategoriDetailPage() {
  const { nama } = useParams<{ nama: string }>();
  const namaDecoded = decodeURIComponent(nama) as KategoriNama;
  const db = useDatabase();
  const members = useKategoriMembers(namaDecoded);
  const [q, setQ] = useState("");

  const valid = KATEGORI_LIST.includes(namaDecoded);

  const alamatOf = (i: Individu) =>
    db.households.find((h) => h.id === i.rumah_tangga_id)?.alamat ?? "-";
  const kbLabel = (v: string) =>
    STATUS_KB_OPTIONS.find((o) => o.value === v)?.label ?? v;

  const filtered = useMemo(() => {
    const term = q.toLowerCase().trim();
    return members.filter(
      (m) => !term || m.nama.toLowerCase().includes(term) || m.nik.includes(term)
    );
  }, [members, q]);

  const isPUS = namaDecoded === "PUS";

  if (!valid) {
    return (
      <EmptyState
        title="Kategori tidak dikenal"
        action={
          <Link href="/dashboard">
            <Button size="sm" variant="outline">Kembali</Button>
          </Link>
        }
      />
    );
  }

  const meta = KATEGORI_META[namaDecoded];

  const buildRows = (): { headers: string[]; rows: string[][] } => {
    if (isPUS) {
      return {
        headers: ["Istri", "NIK Istri", "Status KB", "Suami", "Usia Istri", "Alamat"],
        rows: filtered.map((m) => {
          const suami = db.individuals.find((i) => i.id === m.pasangan_id);
          return [
            m.nama,
            m.nik,
            kbLabel(m.status_kb),
            suami?.nama ?? "-",
            usiaDisplay(m.tanggal_lahir),
            alamatOf(m),
          ];
        }),
      };
    }
    return {
      headers: ["Nama", "NIK", "Usia", "Tanggal Lahir", "Jenis Kelamin", "Alamat"],
      rows: filtered.map((m) => [
        m.nama,
        m.nik,
        usiaDisplay(m.tanggal_lahir),
        formatTanggal(m.tanggal_lahir),
        m.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan",
        alamatOf(m),
      ]),
    };
  };

  const handleExportCSV = () => {
    const { headers, rows } = buildRows();
    exportCSV(`kategori-${namaDecoded}-${Date.now()}`, [headers, ...rows]);
  };

  const handleExportPDF = () => {
    const { headers, rows } = buildRows();
    const judul = `Kategori ${namaDecoded} · ${members.length} warga`;
    exportPDF(judul, headers, rows);
  };

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-lg text-2xl ${meta.color}`}>
            {meta.icon}
          </div>
          <div>
            <h1 className="text-xl font-bold">{namaDecoded}</h1>
            <p className="text-sm text-muted-foreground">
              {members.length} warga · {meta.deskripsi}
            </p>
          </div>
        </div>
        {filtered.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <FileText className="h-4 w-4" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <FileDown className="h-4 w-4" /> PDF
            </Button>
          </div>
        )}
      </div>

      <SearchBar value={q} onChange={setQ} placeholder="Cari nama / NIK..." />

      {filtered.length === 0 ? (
        <EmptyState title="Tidak ada warga di kategori ini" />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
              {isPUS ? (
                <tr>
                  <th className="p-3">Istri</th>
                  <th className="p-3">Suami</th>
                  <th className="p-3">Status KB</th>
                  <th className="p-3">Usia</th>
                  <th className="p-3">Alamat</th>
                </tr>
              ) : (
                <tr>
                  <th className="p-3">Nama</th>
                  <th className="p-3">NIK</th>
                  <th className="p-3">Usia</th>
                  <th className="p-3">Tgl Lahir</th>
                  <th className="p-3">Alamat</th>
                </tr>
              )}
            </thead>
            <tbody>
              {filtered.map((m) => {
                const suami = db.individuals.find((i) => i.id === m.pasangan_id);
                return (
                  <tr key={m.id} className="border-b border-border last:border-0">
                    {isPUS ? (
                      <>
                        <td className="p-3 font-medium">{m.nama}</td>
                        <td className="p-3">{suami?.nama ?? "-"}</td>
                        <td className="p-3">{kbLabel(m.status_kb)}</td>
                        <td className="p-3">{usiaDisplay(m.tanggal_lahir)}</td>
                        <td className="p-3 text-muted-foreground">{alamatOf(m)}</td>
                      </>
                    ) : (
                      <>
                        <td className="p-3 font-medium">
                          <Link
                            href={`/rumah-tangga/${m.rumah_tangga_id}/anggota/${m.id}`}
                            className="hover:underline"
                          >
                            {m.nama}
                          </Link>
                        </td>
                        <td className="p-3 text-muted-foreground">{m.nik}</td>
                        <td className="p-3">{usiaDisplay(m.tanggal_lahir)}</td>
                        <td className="p-3">{formatTanggal(m.tanggal_lahir)}</td>
                        <td className="p-3 text-muted-foreground">{alamatOf(m)}</td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
