"use client";

import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { IndividualSchema, type IndividualInput } from "@/lib/validation";
import { store } from "@/lib/store";
import { useIndividuals } from "@/hooks/useData";
import { useNotification } from "@/contexts/NotificationContext";
import { tentukanKategori } from "@/lib/kategorisasi";
import { usiaDisplay, hitungUsia } from "@/lib/date";
import { PERAN_KK_OPTIONS, STATUS_KB_OPTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input, Select, Label, FieldError } from "@/components/ui/input";
import { KategoriBadge } from "@/components/cards/KategoriCard";
import type { Individu } from "@/lib/types";

export function IndividualForm({
  rumahTanggaId,
  existing,
}: {
  rumahTanggaId: string;
  existing?: Individu;
}) {
  const router = useRouter();
  const { notify } = useNotification();
  const anggotaRumah = useIndividuals(rumahTanggaId);
  const [nikDuplikat, setNikDuplikat] = useState<Individu | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<IndividualInput>({
    resolver: zodResolver(IndividualSchema),
    defaultValues: existing
      ? {
          nama: existing.nama,
          nik: existing.nik,
          tanggal_lahir: existing.tanggal_lahir,
          jenis_kelamin: existing.jenis_kelamin,
          peran_dalam_kk: existing.peran_dalam_kk,
          status_kb: existing.status_kb,
          status_hamil: existing.status_hamil,
          perkiraan_tgl_lahir: existing.perkiraan_tgl_lahir ?? "",
          pasangan_id: existing.pasangan_id ?? "",
          status: existing.status,
        }
      : {
          jenis_kelamin: "P",
          peran_dalam_kk: "anak",
          status_kb: "tidak",
          status_hamil: false,
          status: "aktif",
        },
  });

  const tanggalLahir = watch("tanggal_lahir");
  const jenisKelamin = watch("jenis_kelamin");
  const statusHamil = watch("status_hamil");
  const peran = watch("peran_dalam_kk");
  const pasanganId = watch("pasangan_id");

  // Real-time kategori preview
  const preview = useMemo(() => {
    if (!tanggalLahir) return null;
    return tentukanKategori({
      tanggal_lahir: tanggalLahir,
      jenis_kelamin: jenisKelamin,
      status_hamil: statusHamil,
      punya_pasangan: Boolean(pasanganId),
    });
  }, [tanggalLahir, jenisKelamin, statusHamil, pasanganId]);

  const isWUS = useMemo(() => {
    if (!tanggalLahir || jenisKelamin !== "P") return false;
    const { tahun } = hitungUsia(tanggalLahir);
    return tahun >= 15 && tahun <= 49;
  }, [tanggalLahir, jenisKelamin]);

  const checkNik = (nik: string) => {
    if (nik.length === 16) {
      const dup = store.nikExists(nik, existing?.id);
      setNikDuplikat(dup ?? null);
    } else {
      setNikDuplikat(null);
    }
  };

  const calonPasangan = anggotaRumah.filter(
    (a) => a.id !== existing?.id && a.jenis_kelamin === "L"
  );

  const onSubmit = async (data: IndividualInput) => {
    if (store.nikExists(data.nik, existing?.id)) {
      notify("NIK sudah terdaftar untuk warga lain", "error");
      return;
    }

    const payload: Omit<Individu, "id" | "created_at"> = {
      rumah_tangga_id: rumahTanggaId,
      nama: data.nama,
      nik: data.nik,
      tanggal_lahir: data.tanggal_lahir,
      jenis_kelamin: data.jenis_kelamin,
      peran_dalam_kk: data.peran_dalam_kk,
      status_kb: data.status_kb,
      status_hamil: isWUS ? data.status_hamil : false,
      perkiraan_tgl_lahir: data.status_hamil ? data.perkiraan_tgl_lahir : null,
      pasangan_id: data.peran_dalam_kk === "istri" ? data.pasangan_id || null : null,
      status: data.status,
      kategori_terkonfirmasi: existing?.kategori_terkonfirmasi ?? null,
    };

    try {
      if (existing) {
        await store.updateIndividual(existing.id, payload);
        notify("Data anggota diperbarui", "success");
      } else {
        await store.addIndividual(payload);
        notify("Anggota berhasil ditambahkan", "success");
      }
      router.push(`/rumah-tangga/${rumahTanggaId}`);
    } catch (e) {
      notify(
        e instanceof Error ? e.message : "Gagal menyimpan data anggota",
        "error"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Nama</Label>
        <Input placeholder="Nama lengkap" {...register("nama")} />
        <FieldError message={errors.nama?.message} />
      </div>

      <div>
        <Label>NIK</Label>
        <Input
          inputMode="numeric"
          maxLength={16}
          placeholder="16 digit"
          {...register("nik", { onChange: (e) => checkNik(e.target.value) })}
        />
        <FieldError message={errors.nik?.message} />
        {nikDuplikat && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            NIK sudah dipakai oleh{" "}
            <Link
              href={`/rumah-tangga/${nikDuplikat.rumah_tangga_id}/anggota/${nikDuplikat.id}`}
              className="font-medium underline"
            >
              {nikDuplikat.nama}
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Tanggal Lahir</Label>
          <Input type="date" {...register("tanggal_lahir")} />
          <FieldError message={errors.tanggal_lahir?.message} />
        </div>
        <div>
          <Label>Jenis Kelamin</Label>
          <Select {...register("jenis_kelamin")}>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </Select>
        </div>
      </div>

      {/* Real-time kategori preview */}
      {preview && tanggalLahir && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-primary/10 px-4 py-3 text-sm">
          <span className="font-medium">{usiaDisplay(tanggalLahir)}</span>
          <span className="text-muted-foreground">— Kategori:</span>
          <KategoriBadge nama={preview.kategori_utama} />
          {preview.semua_kategori.length > 1 && (
            <span className="text-xs text-muted-foreground">
              (+{preview.semua_kategori.length - 1} lainnya)
            </span>
          )}
        </div>
      )}

      <div>
        <Label>Peran dalam KK</Label>
        <Select {...register("peran_dalam_kk")}>
          {PERAN_KK_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Pasangan select — hanya jika peran = istri */}
      {peran === "istri" && (
        <div>
          <Label>Pilih Pasangan (Suami)</Label>
          <Select {...register("pasangan_id")}>
            <option value="">— Belum dipilih —</option>
            {calonPasangan.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama} · {p.nik}
              </option>
            ))}
          </Select>
        </div>
      )}

      {/* Status KB — kondisional untuk WUS/perempuan dewasa */}
      {isWUS && (
        <div>
          <Label>Status KB</Label>
          <Select {...register("status_kb")}>
            {STATUS_KB_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
      )}

      {/* Sedang hamil — hanya untuk WUS */}
      {isWUS && (
        <div className="space-y-3 rounded-lg border border-border p-3">
          <Controller
            control={control}
            name="status_hamil"
            render={({ field }) => (
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium">Sedang Hamil</span>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="h-5 w-5 accent-primary"
                />
              </label>
            )}
          />
          {statusHamil && (
            <div>
              <Label>Perkiraan Tanggal Lahir</Label>
              <Input type="date" {...register("perkiraan_tgl_lahir")} />
            </div>
          )}
        </div>
      )}

      <div>
        <Label>Status</Label>
        <Select {...register("status")}>
          <option value="aktif">Aktif</option>
          <option value="pindah">Pindah</option>
          <option value="meninggal">Meninggal</option>
        </Select>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {existing ? "Simpan Perubahan" : "Tambah Anggota"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Batal
        </Button>
      </div>
    </form>
  );
}
