"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { HouseholdSchema, type HouseholdInput } from "@/lib/validation";
import { store } from "@/lib/store";
import { useNotification } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Label, FieldError } from "@/components/ui/input";
import type { RumahTangga } from "@/lib/types";

export function HouseholdForm({ existing }: { existing?: RumahTangga }) {
  const router = useRouter();
  const { notify } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<HouseholdInput>({
    resolver: zodResolver(HouseholdSchema),
    defaultValues: existing
      ? {
          no_rumah: existing.no_rumah,
          no_kk: existing.no_kk ?? "",
          alamat: existing.alamat,
          dusun: existing.dusun,
          rt: existing.rt,
          rw: existing.rw,
          nama_kepala_keluarga: existing.nama_kepala_keluarga,
          status: existing.status,
        }
      : { status: "aktif" },
  });

  const onSubmit = async (data: HouseholdInput) => {
    if (store.noRumahExists(data.no_rumah, existing?.id)) {
      notify("Nomor rumah sudah terdaftar", "error");
      return;
    }
    if (data.no_kk && store.noKKExists(data.no_kk, existing?.id)) {
      notify("Nomor KK sudah terdaftar", "error");
      return;
    }
    try {
      if (existing) {
        await store.updateHousehold(existing.id, data);
        notify("Rumah tangga diperbarui", "success");
        router.push(`/rumah-tangga/${existing.id}`);
      } else {
        const rt = await store.addHousehold(data);
        notify("Rumah tangga berhasil ditambahkan", "success");
        router.push(`/rumah-tangga/${rt.id}`);
      }
    } catch (e) {
      notify(
        e instanceof Error ? e.message : "Gagal menyimpan rumah tangga",
        "error"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Nomor Rumah</Label>
        <Input placeholder="001" {...register("no_rumah")} />
        <FieldError message={errors.no_rumah?.message} />
      </div>

      <div>
        <Label>Nomor KK (opsional)</Label>
        <Input
          inputMode="numeric"
          maxLength={16}
          placeholder="16 digit"
          {...register("no_kk")}
        />
        <FieldError message={errors.no_kk?.message} />
      </div>

      <div>
        <Label>Nama Kepala Keluarga</Label>
        <Input placeholder="Nama lengkap" {...register("nama_kepala_keluarga")} />
        <FieldError message={errors.nama_kepala_keluarga?.message} />
      </div>

      <div>
        <Label>Alamat</Label>
        <Textarea placeholder="Jl. ..." {...register("alamat")} />
        <FieldError message={errors.alamat?.message} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>Desa</Label>
          <Input {...register("dusun")} />
        </div>
        <div>
          <Label>RT</Label>
          <Input {...register("rt")} />
        </div>
        <div>
          <Label>RW</Label>
          <Input {...register("rw")} />
        </div>
      </div>

      <div>
        <Label>Status</Label>
        <Select {...register("status")}>
          <option value="aktif">Aktif</option>
          <option value="pindah">Pindah</option>
        </Select>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {existing ? "Simpan Perubahan" : "Tambah Rumah Tangga"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Batal
        </Button>
      </div>
    </form>
  );
}
