"use client";

import Link from "next/link";
import { memo } from "react";
import { KATEGORI_META } from "@/lib/constants";
import type { KategoriNama } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export const KategoriBadge = memo(function KategoriBadge({
  nama,
}: {
  nama: KategoriNama;
}) {
  const meta = KATEGORI_META[nama];
  return (
    <Badge className={meta.color}>
      <span className="mr-1">{meta.icon}</span>
      {nama}
    </Badge>
  );
});

export const KategoriCard = memo(function KategoriCard({
  nama,
  jumlah,
}: {
  nama: KategoriNama;
  jumlah: number;
}) {
  const meta = KATEGORI_META[nama];
  return (
    <Link
      href={`/kategori/${encodeURIComponent(nama)}`}
      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-primary hover:shadow-md"
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg text-2xl ${meta.color}`}>
        {meta.icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{nama}</p>
        <p className="truncate text-xs text-muted-foreground">{meta.deskripsi}</p>
      </div>
      <div className="text-2xl font-bold text-foreground group-hover:text-primary">
        {jumlah}
      </div>
    </Link>
  );
});
