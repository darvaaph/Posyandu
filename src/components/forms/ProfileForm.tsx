"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import type { KaderProfile } from "@/lib/types";

export function ProfileForm({ kader }: { kader: KaderProfile }) {
  const { notify } = useNotification();
  const { logout, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nama_kader: kader.nama_kader,
    nama_posyandu: kader.nama_posyandu,
    wilayah: kader.wilayah,
    email: kader.email,
  });

  const update = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSave = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      notify("Profil diperbarui", "success");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Gagal menyimpan profil", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Nama Kader</Label>
        <Input value={form.nama_kader} onChange={(e) => update("nama_kader", e.target.value)} />
      </div>
      <div>
        <Label>Nama Posyandu</Label>
        <Input value={form.nama_posyandu} onChange={(e) => update("nama_posyandu", e.target.value)} />
      </div>
      <div>
        <Label>Wilayah</Label>
        <Input value={form.wilayah} onChange={(e) => update("wilayah", e.target.value)} />
      </div>
      <div>
        <Label>Email</Label>
        <Input value={form.email} onChange={(e) => update("email", e.target.value)} />
      </div>
      <Button onClick={onSave} disabled={saving} className="w-full">
        {saving ? "Menyimpan..." : "Simpan Profil"}
      </Button>
      <Button variant="outline" onClick={logout} className="w-full">
        Keluar
      </Button>
    </div>
  );
}
