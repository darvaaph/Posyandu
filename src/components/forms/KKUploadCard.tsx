"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Upload, Sparkles, Loader2 } from "lucide-react";
import {
  fileToCompressedBase64,
  extractKK,
  KK_REVIEW_KEY,
} from "@/lib/extractKK";
import { useNotification } from "@/contexts/NotificationContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function KKUploadCard() {
  const router = useRouter();
  const { notify } = useNotification();
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset agar bisa pilih file sama lagi
    if (!file) return;

    setLoading(true);
    try {
      const image = await fileToCompressedBase64(file);
      const data = await extractKK(image);
      // Teruskan hasil ke layar review (gambar TIDAK ikut disimpan)
      sessionStorage.setItem(KK_REVIEW_KEY, JSON.stringify(data));
      notify("KK terbaca, cek hasilnya sebelum simpan", "success");
      router.push("/rumah-tangga/tambah-kk");
    } catch (err) {
      notify(
        err instanceof Error ? err.message : "Gagal membaca KK",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/30 bg-accent/40">
      <CardContent className="space-y-3 pt-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Foto KK, data langsung terisi</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Foto KK lalu cek hasilnya. Data warga langsung terisi, tinggal simpan.
          Foto tidak tersimpan di aplikasi.
        </p>

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFile}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFile}
        />

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Membaca KK...
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              className="flex-1"
              onClick={() => cameraRef.current?.click()}
            >
              <Camera className="h-4 w-4" /> Ambil Foto
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-4 w-4" /> Unggah Gambar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
