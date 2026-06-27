"use client";

import { RotateCcw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { store } from "@/lib/store";
import { useNotification } from "@/contexts/NotificationContext";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/Common";

export default function ProfilPage() {
  const { kader } = useAuth();
  const { notify } = useNotification();

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

      <Card>
        <CardContent className="flex items-center justify-between pt-5">
          <div>
            <p className="text-sm font-medium">Data Contoh</p>
            <p className="text-xs text-muted-foreground">
              Kembalikan data warga ke contoh awal (demo).
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              store.resetSeed();
              notify("Data contoh dipulihkan", "success");
            }}
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
