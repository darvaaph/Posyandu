"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, FileText, Trash2, FileDown } from "lucide-react";
import { useReports } from "@/hooks/useData";
import { useDatabase } from "@/hooks/useData";
import { store } from "@/lib/store";
import { useNotification } from "@/contexts/NotificationContext";
import { formatTanggalWaktu, usiaDisplay, parsePeriode } from "@/lib/date";
import { termasukKategori } from "@/lib/kategorisasi";
import { exportPDF, exportCSV } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/Common";
import { ConfirmDeleteDialog } from "@/components/dialogs/ConfirmDeleteDialog";
import type { KategoriNama, Laporan } from "@/lib/types";

export default function LaporanPage() {
  const reports = useReports();
  const db = useDatabase();
  const { notify } = useNotification();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const rowsFor = (lap: Laporan) => {
    if (lap.data_warga && lap.data_warga.length > 0) {
      return lap.data_warga.map((w) => [
        w.nama,
        w.nik,
        w.usia,
        w.jk,
      ]);
    }
    const refDate = parsePeriode(lap.periode);
    const members =
      lap.kategori === "Semua"
        ? db.individuals.filter(
            (i) => i.status === "aktif" && (!refDate || !i.created_at || new Date(i.created_at) <= refDate)
          )
        : db.individuals.filter((i) => termasukKategori(i, lap.kategori as KategoriNama, refDate));
    return members.map((m) => [
      m.nama,
      m.nik,
      usiaDisplay(m.tanggal_lahir, refDate),
      m.jenis_kelamin === "L" ? "L" : "P",
    ]);
  };

  const handlePDF = (lap: Laporan) => {
    exportPDF(lap.judul, ["Nama", "NIK", "Usia", "JK"], rowsFor(lap) as string[][]);
  };
  const handleExcel = (lap: Laporan) => {
    exportCSV(lap.judul, [["Nama", "NIK", "Usia", "JK"], ...rowsFor(lap)]);
    notify("Laporan diekspor (CSV)", "success");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Laporan</h1>
          <p className="text-sm text-muted-foreground">
            {reports.length} laporan tersimpan
          </p>
        </div>
        <Link href="/laporan/generate">
          <Button size="sm">
            <Plus className="h-4 w-4" /> Generate
          </Button>
        </Link>
      </div>

      {reports.length === 0 ? (
        <EmptyState
          title="Belum ada laporan"
          description="Buat laporan per kategori untuk diekspor ke PDF / Excel."
          action={
            <Link href="/laporan/generate">
              <Button size="sm">
                <Plus className="h-4 w-4" /> Generate Laporan
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {reports.map((lap) => (
            <Card key={lap.id} className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{lap.judul}</p>
                <p className="text-xs text-muted-foreground">
                  {formatTanggalWaktu(lap.created_at)}
                </p>
              </div>
              <Badge className="bg-accent text-accent-foreground">
                {lap.jumlah_data} data
              </Badge>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => handlePDF(lap)} title="PDF">
                  <FileDown className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleExcel(lap)} title="Excel">
                  <FileText className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(lap.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDeleteDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) {
            try {
              await store.deleteReport(deleteId);
              notify("Laporan dihapus", "success");
            } catch (e) {
              notify(e instanceof Error ? e.message : "Gagal menghapus", "error");
            }
          }
        }}
        title="Hapus laporan?"
      />
    </div>
  );
}
