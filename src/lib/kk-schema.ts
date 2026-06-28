import { z } from "zod";

// Skema hasil ekstraksi dari foto Kartu Keluarga.
// Sengaja PERMISIF (mis. NIK string biasa, bukan regex ketat) supaya model tetap
// mengembalikan apa pun yang terbaca — validasi & koreksi dilakukan kader di
// layar review, bukan dengan menggagalkan ekstraksi.
export const KKAnggotaSchema = z.object({
  nama: z.string(),
  nik: z.string(), // idealnya 16 digit — divalidasi terpisah, jangan ketat di sini
  tanggal_lahir: z.string(), // format YYYY-MM-DD
  jenis_kelamin: z.enum(["L", "P"]),
  hubungan: z.string(), // mentah dari KK: "KEPALA KELUARGA", "ISTRI", "ANAK", dst.
});

export const KKExtractionSchema = z.object({
  no_kk: z.string().nullable().optional(),
  alamat: z.string().default(""),
  dusun: z.string().nullable().optional(),
  rt: z.string().nullable().optional(),
  rw: z.string().nullable().optional(),
  nama_kepala_keluarga: z.string().default(""),
  anggota: z.array(KKAnggotaSchema).default([]),
});

export type KKExtraction = z.infer<typeof KKExtractionSchema>;
export type KKAnggota = z.infer<typeof KKAnggotaSchema>;

// Tipe gambar yang diterima endpoint ekstraksi.
export const ALLOWED_KK_MEDIA = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export type KKMediaType = (typeof ALLOWED_KK_MEDIA)[number];

export const MAX_KK_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB
