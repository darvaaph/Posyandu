"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useDatabase } from "@/hooks/useData";
import { HouseholdForm } from "@/components/forms/HouseholdForm";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/common/Common";
import { Button } from "@/components/ui/button";

export default function EditRumahTanggaPage() {
  const { id } = useParams<{ id: string }>();
  const db = useDatabase();
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

  return (
    <div className="space-y-4">
      <Link
        href={`/rumah-tangga/${rt.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>
      <h1 className="text-xl font-bold">Edit Rumah Tangga</h1>
      <Card>
        <CardContent className="pt-5">
          <HouseholdForm existing={rt} />
        </CardContent>
      </Card>
    </div>
  );
}
