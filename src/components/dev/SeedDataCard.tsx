"use client";

import { useState } from "react";
import { Database, Trash2, FlaskConical } from "lucide-react";
import { store } from "@/lib/store";
import { useNotification } from "@/contexts/NotificationContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDeleteDialog } from "@/components/dialogs/ConfirmDeleteDialog";

/**
 * Kartu alat bantu pengembangan: isi data contoh & hapus semua data.
 * HANYA dirender saat NEXT_PUBLIC_APP_ENV !== "production".
 */
export function SeedDataCard() {
  const { notify } = useNotification();
  const [busy, setBusy] = useState<"seed" | "clear" | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const seed = async () => {
    setBusy("seed");
    try {
      await store.seedSampleData();
      notify("Data contoh berhasil dibuat", "success");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Gagal membuat data contoh", "error");
    } finally {
      setBusy(null);
    }
  };

  const clear = async () => {
    setBusy("clear");
    try {
      await store.clearAllData();
      notify("Semua data dihapus", "success");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Gagal menghapus data", "error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card className="border-dashed border-amber-300 bg-amber-50/50">
      <CardContent className="space-y-3 pt-5">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-amber-600" />
          <p className="text-sm font-semibold">Alat Pengembangan</p>
          <Badge className="bg-amber-100 text-amber-700">dev only</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Hanya tampil saat mode development. Otomatis hilang di production
          (<code>NEXT_PUBLIC_APP_ENV=production</code>).
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={seed}
            disabled={busy !== null}
          >
            <Database className="h-4 w-4" />
            {busy === "seed" ? "Mengisi..." : "Isi Data Contoh"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/10"
            onClick={() => setConfirmOpen(true)}
            disabled={busy !== null}
          >
            <Trash2 className="h-4 w-4" />
            {busy === "clear" ? "Menghapus..." : "Hapus Semua Data"}
          </Button>
        </div>
      </CardContent>

      <ConfirmDeleteDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={clear}
        title="Hapus semua data?"
        description="Seluruh rumah tangga, anggota, dan laporan milik akun ini akan dihapus permanen (jadi 0)."
      />
    </Card>
  );
}
