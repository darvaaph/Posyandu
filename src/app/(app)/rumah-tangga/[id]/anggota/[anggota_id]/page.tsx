"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useDatabase } from "@/hooks/useData";
import { IndividualForm } from "@/components/forms/IndividualForm";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/common/Common";
import { Button } from "@/components/ui/button";

export default function EditAnggotaPage() {
  const { id, anggota_id } = useParams<{ id: string; anggota_id: string }>();
  const db = useDatabase();
  const anggota = db.individuals.find((i) => i.id === anggota_id);

  if (!anggota) {
    return (
      <EmptyState
        title="Anggota tidak ditemukan"
        action={
          <Link href={`/rumah-tangga/${id}`}>
            <Button size="sm" variant="outline">Kembali</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href={`/rumah-tangga/${id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>
      <h1 className="text-xl font-bold">Edit Anggota</h1>
      <Card>
        <CardContent className="pt-5">
          <IndividualForm rumahTanggaId={anggota.rumah_tangga_id} existing={anggota} />
        </CardContent>
      </Card>
    </div>
  );
}
