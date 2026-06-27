"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { IndividualForm } from "@/components/forms/IndividualForm";
import { Card, CardContent } from "@/components/ui/card";

export default function TambahAnggotaPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-4">
      <Link
        href={`/rumah-tangga/${id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>
      <h1 className="text-xl font-bold">Tambah Anggota</h1>
      <Card>
        <CardContent className="pt-5">
          <IndividualForm rumahTanggaId={id} />
        </CardContent>
      </Card>
    </div>
  );
}
