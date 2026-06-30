"use client";

import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { SeedDataCard } from "@/components/dev/SeedDataCard";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/Common";

const isDev = process.env.NEXT_PUBLIC_APP_ENV !== "production";

export default function ProfilPage() {
  const { kader } = useAuth();

  if (!kader) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Profil Kader</h1>

      <Card>
        <CardContent className="flex items-center gap-4 pt-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl text-primary-foreground">
            {kader.nama_kader.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold">{kader.nama_kader}</p>
            <p className="text-sm text-muted-foreground">{kader.nama_posyandu}</p>
            <p className="text-xs text-muted-foreground">{kader.wilayah}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <ProfileForm kader={kader} />
        </CardContent>
      </Card>

      <Link href="/panduan" className="block">
        <Card className="flex items-center gap-3 p-4 transition hover:border-primary">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Panduan Penggunaan</p>
            <p className="text-xs text-muted-foreground">
              Cara memakai aplikasi & memasang di HP
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Card>
      </Link>

      {isDev && <SeedDataCard />}
    </div>
  );
}
