"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { useDatabase, useIndividuals } from "@/hooks/useData";
import { store } from "@/lib/store";
import { useNotification } from "@/contexts/NotificationContext";
import { kategoriIndividu } from "@/lib/kategorisasi";
import { usiaDisplay } from "@/lib/date";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/Common";
import { KategoriBadge } from "@/components/cards/KategoriCard";
import { ConfirmDeleteDialog } from "@/components/dialogs/ConfirmDeleteDialog";
import { PERAN_KK_OPTIONS } from "@/lib/constants";

export default function RumahTanggaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { notify } = useNotification();
  const db = useDatabase();
  const anggota = useIndividuals(id);
  const [deleteHouseOpen, setDeleteHouseOpen] = useState(false);
  const [deleteAnggotaId, setDeleteAnggotaId] = useState<string | null>(null);

  const rt = db.households.find((h) => h.id === id);

  if (!rt) {
    return (
      <EmptyState
        title="Rumah tangga tidak ditemukan"
        action={
          <Link href="/rumah-tangga">
            <Button size="sm" variant="outline">Kembali</Button>
          </Link>
        }
      />
    );
  }

  const peranLabel = (v: string) =>
    PERAN_KK_OPTIONS.find((o) => o.value === v)?.label ?? v;

  return (
    <div className="space-y-4">
      <Link
        href="/rumah-tangga"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Daftar Rumah Tangga
      </Link>

      <Card>
        <CardContent className="space-y-2 pt-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-lg font-bold">{rt.nama_kepala_keluarga}</h1>
              <p className="text-sm text-muted-foreground">No. Rumah {rt.no_rumah}</p>
            </div>
            <Badge
              className={
                rt.status === "aktif"
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-600"
              }
            >
              {rt.status}
            </Badge>
          </div>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {rt.alamat}
            {rt.dusun && ` · ${rt.dusun}`}
            {(rt.rt || rt.rw) && ` · RT ${rt.rt}/RW ${rt.rw}`}
          </p>
          <div className="flex gap-2 pt-2">
            <Link href={`/rumah-tangga/${rt.id}/edit`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <Pencil className="h-4 w-4" /> Edit
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteHouseOpen(true)}
            >
              <Trash2 className="h-4 w-4" /> Hapus
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Anggota Keluarga ({anggota.length})</h2>
        <Link href={`/rumah-tangga/${rt.id}/anggota/tambah`}>
          <Button size="sm">
            <Plus className="h-4 w-4" /> Anggota
          </Button>
        </Link>
      </div>

      {anggota.length === 0 ? (
        <EmptyState title="Belum ada anggota" description="Tambahkan anggota keluarga." />
      ) : (
        <div className="space-y-2">
          {anggota.map((a) => {
            const kat = kategoriIndividu(a);
            return (
              <Card key={a.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{a.nama}</p>
                      {kat.semua_kategori.map((nama) => (
                        <KategoriBadge key={nama} nama={nama} />
                      ))}
                      {a.status !== "aktif" && (
                        <Badge className="bg-slate-100 text-slate-600">{a.status}</Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {peranLabel(a.peran_dalam_kk)} · {usiaDisplay(a.tanggal_lahir)} ·{" "}
                      {a.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                    </p>
                    <p className="text-xs text-muted-foreground">NIK: {a.nik}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Link href={`/rumah-tangga/${rt.id}/anggota/${a.id}`}>
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteAnggotaId(a.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDeleteDialog
        open={deleteHouseOpen}
        onClose={() => setDeleteHouseOpen(false)}
        onConfirm={async () => {
          try {
            await store.deleteHousehold(rt.id);
            notify("Rumah tangga dihapus", "success");
            router.push("/rumah-tangga");
          } catch (e) {
            notify(e instanceof Error ? e.message : "Gagal menghapus", "error");
          }
        }}
        title="Hapus rumah tangga?"
        description="Seluruh anggota di rumah tangga ini juga akan dihapus."
      />

      <ConfirmDeleteDialog
        open={deleteAnggotaId !== null}
        onClose={() => setDeleteAnggotaId(null)}
        onConfirm={async () => {
          if (deleteAnggotaId) {
            try {
              await store.deleteIndividual(deleteAnggotaId);
              notify("Anggota dihapus", "success");
            } catch (e) {
              notify(e instanceof Error ? e.message : "Gagal menghapus", "error");
            }
          }
        }}
        title="Hapus anggota?"
      />
    </div>
  );
}
