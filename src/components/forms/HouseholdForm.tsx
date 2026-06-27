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
          alamat: existing.alamat,
          dusun: existing.dusun,
          rt: existing.rt,
          rw: existing.rw,
          nama_kepala_keluarga: existing.nama_kepala_keluarga,
          status: existing.status,
        }
      : { status: "aktif" },
  });

  const onSubmit = (data: HouseholdInput) => {
    if (store.noRumahExists(data.no_rumah, existing?.id)) {
      notify("Nomor rumah sudah terdaftar", "error");
      return;
    }
    if (existing) {
      store.updateHousehold(existing.id, data);
      notify("Rumah tangga diperbarui", "success");
      router.push(`/rumah-tangga/${existing.id}`);
    } else {
      const rt = store.addHousehold(data);
      notify("Rumah tangga berhasil ditambahkan", "success");
      router.push(`/rumah-tangga/${rt.id}`);
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
          <Label>Dusun</Label>
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
