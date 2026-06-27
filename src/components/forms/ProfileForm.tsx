"use client";

import { useState } from "react";
import { store } from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import type { KaderProfile } from "@/lib/types";

export function ProfileForm({ kader }: { kader: KaderProfile }) {
  const { notify } = useNotification();
  const { logout } = useAuth();
  const [form, setForm] = useState({
    nama_kader: kader.nama_kader,
    nama_posyandu: kader.nama_posyandu,
    wilayah: kader.wilayah,
    email: kader.email,
  });

  const update = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSave = () => {
    store.updateKader(form);
    // sinkronkan session
    window.localStorage.setItem(
      "sigap_session_v1",
      JSON.stringify({ ...kader, ...form })
    );
    notify("Profil diperbarui", "success");
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
      <Button onClick={onSave} className="w-full">
        Simpan Profil
      </Button>
      <Button variant="outline" onClick={logout} className="w-full">
        Keluar
      </Button>
    </div>
  );
}
