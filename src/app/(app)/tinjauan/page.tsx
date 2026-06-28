"use client";

import { CheckCheck, Check } from "lucide-react";
import { useReviews } from "@/hooks/useReviews";
import { useDatabase } from "@/hooks/useData";
import { store } from "@/lib/store";
import { useNotification } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/common/Common";
import { KategoriBadge } from "@/components/cards/KategoriCard";
import { ArrowRight } from "lucide-react";

export default function TinjauanPage() {
  const reviews = useReviews();
  const db = useDatabase();
  const { notify } = useNotification();

  const totalAktif = db.individuals.filter((i) => i.status === "aktif").length;
  const sudahKonfirmasi = totalAktif - reviews.length;
  const persen = totalAktif > 0 ? Math.round((sudahKonfirmasi / totalAktif) * 100) : 100;

  const konfirmasi = async (individuId: string, kategoriBaru: string) => {
    try {
      await store.updateIndividual(individuId, {
        kategori_terkonfirmasi: kategoriBaru as never,
      });
      notify("Kategori dikonfirmasi", "success");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Gagal konfirmasi", "error");
    }
  };

  const konfirmasiSemua = async () => {
    try {
      await Promise.all(
        reviews.map((r) =>
          store.updateIndividual(r.individu_id, {
            kategori_terkonfirmasi: r.kategori_baru as never,
          })
        )
      );
      notify(`${reviews.length} warga dikonfirmasi`, "success");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Gagal konfirmasi", "error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Tinjauan Bulanan</h1>
          <p className="text-sm text-muted-foreground">
            {reviews.length} warga dengan perubahan kategori
          </p>
        </div>
        {reviews.length > 0 && (
          <Button size="sm" onClick={konfirmasiSemua}>
            <CheckCheck className="h-4 w-4" /> Konfirmasi Semua
          </Button>
        )}
      </div>

      {/* Progress bar konfirmasi */}
      <Card className="px-4 py-3">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Progress Tinjauan</span>
          <span className="text-muted-foreground">
            {sudahKonfirmasi}/{totalAktif} dikonfirmasi
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${persen}%` }}
          />
        </div>
        <p className="mt-1.5 text-right text-xs text-muted-foreground">{persen}%</p>
      </Card>

      {reviews.length === 0 ? (
        <EmptyState
          title="Semua warga sudah dikonfirmasi 🎉"
          description="Tidak ada perubahan kategori yang perlu ditinjau bulan ini."
        />
      ) : (
        <div className="space-y-2">
          {reviews.map((r) => (
            <Card key={r.individu_id} className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{r.nama}</p>
                <p className="text-xs text-muted-foreground">{r.usia_display}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                  {r.kategori_lama ? (
                    <KategoriBadge nama={r.kategori_lama} />
                  ) : (
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-muted-foreground">
                      Baru
                    </span>
                  )}
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  <KategoriBadge nama={r.kategori_baru} />
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => konfirmasi(r.individu_id, r.kategori_baru)}
              >
                <Check className="h-4 w-4" /> Konfirmasi
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
