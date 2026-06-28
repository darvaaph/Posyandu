"use client";

import { supabase } from "./supabase";
import type { KKExtraction } from "./kk-schema";

/** Kompres + ubah gambar jadi base64 (tanpa prefix data URI) di browser. */
export async function fileToCompressedBase64(
  file: File,
  maxDim = 1600,
  quality = 0.85
): Promise<{ base64: string; mediaType: "image/jpeg" }> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => reject(new Error("Gagal membaca file"));
    fr.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("Gambar tidak valid"));
    i.src = dataUrl;
  });

  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak didukung");
  ctx.drawImage(img, 0, 0, w, h);

  const out = canvas.toDataURL("image/jpeg", quality);
  return { base64: out.split(",")[1], mediaType: "image/jpeg" };
}

/** Kirim gambar KK ke endpoint server untuk diekstrak. */
export async function extractKK(image: {
  base64: string;
  mediaType: string;
}): Promise<KKExtraction> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error("Sesi tidak ditemukan. Silakan login ulang.");

  const res = await fetch("/api/extract-kk", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ image: image.base64, mediaType: image.mediaType }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || "Ekstraksi gagal. Coba lagi.");
  }
  return json.data as KKExtraction;
}

// Kunci sementara untuk meneruskan hasil ekstraksi ke layar review.
export const KK_REVIEW_KEY = "kk_extraction_review";
