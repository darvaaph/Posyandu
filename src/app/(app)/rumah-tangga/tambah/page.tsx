import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { HouseholdForm } from "@/components/forms/HouseholdForm";
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
      <Card>
        <CardContent className="pt-5">
          <HouseholdForm />
        </CardContent>
      </Card>
    </div>
  );
}
