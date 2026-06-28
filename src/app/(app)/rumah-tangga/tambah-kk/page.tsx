"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Plus, AlertTriangle, Save } from "lucide-react";
import { store } from "@/lib/store";
import { useNotification } from "@/contexts/NotificationContext";
import { KK_REVIEW_KEY } from "@/lib/extractKK";
import {
  toReviewAnggota,
  nikTanggalTidakCocok,
  tanggalDariNIK,
  type ReviewAnggota,
} from "@/lib/kk-mapping";
import type { KKExtraction } from "@/lib/kk-schema";
import { PERAN_KK_OPTIONS } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/input";
import { EmptyState } from "@/components/common/Common";
import type { Individu } from "@/lib/types";

interface HouseState {
  no_rumah: string;
  no_kk: string;
  alamat: string;
  dusun: string;
  rt: string;
  rw: string;
  nama_kepala_keluarga: string;
}

const emptyAnggota: ReviewAnggota = {
  nama: "",
  nik: "",
  tanggal_lahir: "",
  jenis_kelamin: "L",
  peran_dalam_kk: "anggota_lain",
  hubungan_asli: "",
};

const BULAN = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
function formatTanggal(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${BULAN[m - 1]} ${y}`;
}

export default function ReviewKKPage() {
  const router = useRouter();
  const { notify } = useNotification();
  const [ready, setReady] = useState(false);
  const [found, setFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [house, setHouse] = useState<HouseState>({
    no_rumah: "",
    no_kk: "",
    alamat: "",
    dusun: "",
    rt: "",
    rw: "",
    nama_kepala_keluarga: "",
  });
  const [anggota, setAnggota] = useState<ReviewAnggota[]>([]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KK_REVIEW_KEY);
      if (raw) {
        const kk = JSON.parse(raw) as KKExtraction;
        setHouse({
          no_rumah: "",
          no_kk: kk.no_kk ?? "",
          alamat: kk.alamat ?? "",
          dusun: kk.dusun ?? "",
          rt: kk.rt ?? "",
          rw: kk.rw ?? "",
          nama_kepala_keluarga: kk.nama_kepala_keluarga ?? "",
        });
        setAnggota((kk.anggota ?? []).map(toReviewAnggota));
        setFound(true);
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const setH = (k: keyof HouseState, v: string) =>
    setHouse((s) => ({ ...s, [k]: v }));

  const setA = (i: number, patch: Partial<ReviewAnggota>) =>
    setAnggota((arr) => arr.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));

  const removeA = (i: number) =>
    setAnggota((arr) => arr.filter((_, idx) => idx !== i));

  const onSave = async () => {
    // Validasi ringan
    const issues: string[] = [];
    if (!house.no_rumah.trim()) issues.push("Nomor rumah wajib diisi");
    if (house.no_kk && !/^\d{16}$/.test(house.no_kk))
      issues.push("No. KK harus 16 digit");
    if (anggota.length === 0) issues.push("Minimal 1 anggota");
    anggota.forEach((a, i) => {
      const baris = a.nama || `Baris ${i + 1}`;
      if (!a.nama.trim()) issues.push(`${baris}: nama kosong`);
      if (!/^\d{16}$/.test(a.nik)) issues.push(`${baris}: NIK harus 16 digit`);
      if (!a.tanggal_lahir) issues.push(`${baris}: tanggal lahir kosong`);
    });
    if (store.noRumahExists(house.no_rumah))
      issues.push("Nomor rumah sudah terdaftar");
    if (house.no_kk && store.noKKExists(house.no_kk))
      issues.push("No. KK sudah terdaftar");

    if (issues.length) {
      notify(issues[0], "error");
      return;
    }

    setSaving(true);
    try {
      const members: Array<
        Omit<Individu, "id" | "created_at" | "rumah_tangga_id">
      > = anggota.map((a) => ({
        nama: a.nama.trim(),
        nik: a.nik.trim(),
        tanggal_lahir: a.tanggal_lahir,
        jenis_kelamin: a.jenis_kelamin,
        peran_dalam_kk: a.peran_dalam_kk,
        status_kb: "tidak",
        status_hamil: false,
        status: "aktif",
      }));

      const rt = await store.addHouseholdWithMembers(
        {
          no_rumah: house.no_rumah.trim(),
          no_kk: house.no_kk.trim() || null,
          alamat: house.alamat.trim(),
          dusun: house.dusun.trim(),
          rt: house.rt.trim(),
          rw: house.rw.trim(),
          nama_kepala_keluarga: house.nama_kepala_keluarga.trim(),
          status: "aktif",
        },
        members
      );

      sessionStorage.removeItem(KK_REVIEW_KEY);
      notify(`Tersimpan: 1 rumah tangga + ${members.length} anggota`, "success");
      router.push(`/rumah-tangga/${rt.id}`);
    } catch (e) {
      notify(e instanceof Error ? e.message : "Gagal menyimpan", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!ready) return null;

  if (!found) {
    return (
      <EmptyState
        title="Tidak ada data KK untuk ditinjau"
        description="Mulai dari halaman tambah rumah tangga dan foto/unggah KK."
        action={
          <Link href="/rumah-tangga/tambah">
            <Button size="sm" variant="outline">Kembali</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href="/rumah-tangga/tambah"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>
      <div>
        <h1 className="text-xl font-bold">Periksa Hasil Baca KK</h1>
        <p className="text-sm text-muted-foreground">
          Data terisi otomatis. Periksa & perbaiki bila perlu sebelum disimpan.
        </p>
      </div>

      {/* Header rumah tangga */}
      <Card>
        <CardContent className="space-y-3 pt-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Nomor Rumah *</Label>
              <Input
                value={house.no_rumah}
                onChange={(e) => setH("no_rumah", e.target.value)}
                placeholder="001"
              />
            </div>
            <div>
              <Label>Nomor KK</Label>
              <Input
                value={house.no_kk}
                onChange={(e) => setH("no_kk", e.target.value)}
                inputMode="numeric"
                maxLength={16}
              />
            </div>
          </div>
          <div>
            <Label>Nama Kepala Keluarga</Label>
            <Input
              value={house.nama_kepala_keluarga}
              onChange={(e) => setH("nama_kepala_keluarga", e.target.value)}
            />
          </div>
          <div>
            <Label>Alamat</Label>
            <Input
              value={house.alamat}
              onChange={(e) => setH("alamat", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Desa</Label>
              <Input value={house.dusun} onChange={(e) => setH("dusun", e.target.value)} />
            </div>
            <div>
              <Label>RT</Label>
              <Input value={house.rt} onChange={(e) => setH("rt", e.target.value)} />
            </div>
            <div>
              <Label>RW</Label>
              <Input value={house.rw} onChange={(e) => setH("rw", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anggota */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Anggota ({anggota.length})</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setAnggota((a) => [...a, { ...emptyAnggota }])}
        >
          <Plus className="h-4 w-4" /> Baris
        </Button>
      </div>

      <div className="space-y-3">
        {anggota.map((a, i) => {
          const mismatch = nikTanggalTidakCocok(a.nik, a.tanggal_lahir);
          return (
            <Card key={i}>
              <CardContent className="space-y-2 pt-4">
                <div className="flex items-start gap-2">
                  <Input
                    value={a.nama}
                    onChange={(e) => setA(i, { nama: e.target.value })}
                    placeholder="Nama"
                    className="font-medium"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeA(i)}
                    aria-label="Hapus baris"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <Input
                  value={a.nik}
                  onChange={(e) => setA(i, { nik: e.target.value })}
                  inputMode="numeric"
                  maxLength={16}
                  placeholder="NIK (16 digit)"
                />
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    type="date"
                    value={a.tanggal_lahir}
                    onChange={(e) => setA(i, { tanggal_lahir: e.target.value })}
                  />
                  <Select
                    value={a.jenis_kelamin}
                    onChange={(e) =>
                      setA(i, { jenis_kelamin: e.target.value as "L" | "P" })
                    }
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </Select>
                  <Select
                    value={a.peran_dalam_kk}
                    onChange={(e) =>
                      setA(i, {
                        peran_dalam_kk: e.target
                          .value as ReviewAnggota["peran_dalam_kk"],
                      })
                    }
                  >
                    {PERAN_KK_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                </div>
                {mismatch && (() => {
                  const nikDate = tanggalDariNIK(a.nik);
                  return (
                    <div className="flex flex-wrap items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span className="flex-1">
                        Tanggal lahir tidak cocok dengan NIK.
                        {nikDate && (
                          <> Saran dari NIK:{" "}
                            <strong>{formatTanggal(nikDate)}</strong>.
                          </>
                        )}
                      </span>
                      {nikDate && (
                        <button
                          type="button"
                          className="shrink-0 font-medium underline hover:no-underline"
                          onClick={() => setA(i, { tanggal_lahir: nikDate })}
                        >
                          Pakai
                        </button>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="sticky bottom-20 md:bottom-4">
        <Button onClick={onSave} disabled={saving} className="w-full shadow-lg">
          <Save className="h-4 w-4" />
          {saving ? "Menyimpan..." : "Simpan Semua"}
        </Button>
      </div>
    </div>
  );
}
