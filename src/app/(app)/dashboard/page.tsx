"use client";

import Link from "next/link";
import { Users, Home, ClipboardCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/hooks/useData";
import { useKategoriSummary } from "@/hooks/useKategori";
import { useReviews } from "@/hooks/useReviews";
import { KATEGORI_LIST } from "@/lib/constants";
import { KategoriCard } from "@/components/cards/KategoriCard";
import { ReviewNotification } from "@/components/alerts/ReviewNotification";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  const { kader } = useAuth();
  const db = useDatabase();
  const summary = useKategoriSummary();
  const reviews = useReviews();

  const totalWarga = db.individuals.filter((i) => i.status === "aktif").length;
  const totalRumah = db.households.length;

  const stats = [
    { label: "Rumah Tangga", value: totalRumah, icon: Home, href: "/rumah-tangga" },
    { label: "Total Warga", value: totalWarga, icon: Users, href: "/rumah-tangga" },
    { label: "Perlu Ditinjau", value: reviews.length, icon: ClipboardCheck, href: "/tinjauan" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Selamat datang, {kader?.nama_kader} · {kader?.wilayah}
        </p>
      </div>

      <ReviewNotification />

      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href}>
              <Card className="transition hover:border-primary">
                <CardContent className="flex flex-col gap-1 p-4">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{s.value}</span>
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          Kategori Sasaran
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {KATEGORI_LIST.map((nama) => (
            <KategoriCard key={nama} nama={nama} jumlah={summary[nama]} />
          ))}
        </div>
      </div>
    </div>
  );
}
