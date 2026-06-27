"use client";

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

      {isDev && <SeedDataCard />}
    </div>
  );
}
