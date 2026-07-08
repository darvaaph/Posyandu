"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileDown, FileText } from "lucide-react";
import { useDatabase } from "@/hooks/useData";
import { store } from "@/lib/store";
import { useNotification } from "@/contexts/NotificationContext";
import { termasukKategori } from "@/lib/kategorisasi";
import { usiaDisplay, periodeSekarang, BULAN_ID } from "@/lib/date";
import { KATEGORI_LIST } from "@/lib/constants";
import { exportPDF, exportCSV } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, Input, Label } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import type { KategoriNama } from "@/lib/types";

export default function GenerateLaporanPage() {
  const db = useDatabase();
  const router = useRouter();
  const { notify } = useNotification();

  const [kategori, setKategori] = useState<KategoriNama | "Semua">("Semua");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [previewOpen, setPreviewOpen] = useState(false);

  const now = useMemo(() => new Date(), []);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const isFuturePeriod = useMemo(() => {
    if (selectedYear > currentYear) return true;
    if (selectedYear === currentYear && selectedMonth > currentMonth) return true;
    return false;
  }, [selectedMonth, selectedYear, currentYear, currentMonth]);

  const periode = useMemo(() => {
    return `${BULAN_ID[selectedMonth]} ${selectedYear}`;
  }, [selectedMonth, selectedYear]);

  const refDate = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);
  }, [selectedMonth, selectedYear]);

  const members = useMemo(() => {
    if (kategori === "Semua") {
      return db.individuals.filter(
        (i) => i.status === "aktif" && (!i.created_at || new Date(i.created_at) <= refDate)
      );
    }
    return db.individuals.filter((i) => termasukKategori(i, kategori, refDate));
  }, [db.individuals, kategori, refDate]);

  const judul = `Laporan ${kategori} - ${periode}`;

  const rows = members.map((m) => [
    m.nama,
    m.nik,
    usiaDisplay(m.tanggal_lahir, refDate),
    m.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan",
  ]);

  const simpan = () =>
    store.addReport({
      judul,
      kategori,
      jumlah_data: members.length,
      periode,
    });

  const handlePDF = async () => {
    try {
      await simpan();
      exportPDF(judul, ["Nama", "NIK", "Usia", "Jenis Kelamin"], rows as string[][]);
      notify("Laporan dibuat & dicetak", "success");
      router.push("/laporan");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Gagal membuat laporan", "error");
    }
  };

  const handleExcel = async () => {
    try {
      await simpan();
      exportCSV(judul, [["Nama", "NIK", "Usia", "Jenis Kelamin"], ...rows]);
      notify("Laporan dibuat & diekspor", "success");
      router.push("/laporan");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Gagal membuat laporan", "error");
    }
  };

  return (
    <div className="space-y-4">
      <Link
        href="/laporan"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>
      <h1 className="text-xl font-bold">Generate Laporan</h1>

      <Card>
        <CardContent className="space-y-4 pt-5">
          <div>
            <Label>Kategori</Label>
            <Select
              value={kategori}
              onChange={(e) => setKategori(e.target.value as KategoriNama | "Semua")}
            >
              <option value="Semua">Semua Warga</option>
              {KATEGORI_LIST.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Bulan</Label>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {BULAN_ID.map((bln, idx) => (
                  <option
                    key={bln}
                    value={idx}
                    disabled={selectedYear === currentYear && idx > currentMonth}
                  >
                    {bln}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Tahun</Label>
              <Select
                value={selectedYear}
                onChange={(e) => {
                  const yr = Number(e.target.value);
                  setSelectedYear(yr);
                  if (yr === currentYear && selectedMonth > currentMonth) {
                    setSelectedMonth(currentMonth);
                  }
                }}
              >
                {Array.from({ length: 5 }, (_, i) => currentYear - 4 + i).map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {isFuturePeriod ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive font-medium">
              ⚠️ Periode tidak boleh melebihi bulan saat ini.
            </div>
          ) : (
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <p className="font-medium">{judul}</p>
              <p className="text-muted-foreground">{members.length} data warga akan disertakan</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setPreviewOpen(true)}
              disabled={members.length === 0 || isFuturePeriod}
            >
              Pratinjau
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Pratinjau Laporan"
        className="max-w-2xl"
      >
        <div className="space-y-3">
          <div className="text-sm">
            <p className="font-semibold">{judul}</p>
            <p className="text-muted-foreground">
              {members.length} data · dibuat {periodeSekarang()}
            </p>
          </div>
          <div className="max-h-72 overflow-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted text-left text-xs text-muted-foreground">
                <tr>
                  <th className="p-2">Nama</th>
                  <th className="p-2">NIK</th>
                  <th className="p-2">Usia</th>
                  <th className="p-2">JK</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={idx} className="border-t border-border">
                    <td className="p-2">{r[0]}</td>
                    <td className="p-2 text-muted-foreground">{r[1]}</td>
                    <td className="p-2">{r[2]}</td>
                    <td className="p-2">{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleExcel}>
              <FileText className="h-4 w-4" /> Export Excel
            </Button>
            <Button onClick={handlePDF}>
              <FileDown className="h-4 w-4" /> Export PDF
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
