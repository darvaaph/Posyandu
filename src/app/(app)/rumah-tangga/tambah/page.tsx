import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { HouseholdForm } from "@/components/forms/HouseholdForm";
import { KKUploadCard } from "@/components/forms/KKUploadCard";
import { Card, CardContent } from "@/components/ui/card";

export default function TambahRumahTanggaPage() {
  return (
    <div className="space-y-4">
      <Link
        href="/rumah-tangga"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>
      <h1 className="text-xl font-bold">Tambah Rumah Tangga</h1>

      {/* Opsi cepat: ekstraksi otomatis dari foto KK */}
      <KKUploadCard />

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        atau isi manual
        <div className="h-px flex-1 bg-border" />
      </div>

      <Card>
        <CardContent className="pt-5">
          <HouseholdForm />
        </CardContent>
      </Card>
    </div>
  );
}
