import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const RegisterSchema = z.object({
  nama_kader: z.string().min(3, "Nama kader minimal 3 karakter"),
  nama_posyandu: z.string().min(3, "Nama posyandu minimal 3 karakter"),
  wilayah: z.string().min(2, "Wilayah wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const HouseholdSchema = z.object({
  no_rumah: z.string().min(1, "Nomor rumah wajib diisi"),
  alamat: z.string().min(1, "Alamat wajib diisi"),
  dusun: z.string().optional().default(""),
  rt: z.string().optional().default(""),
  rw: z.string().optional().default(""),
  nama_kepala_keluarga: z.string().min(3, "Nama kepala keluarga minimal 3 karakter"),
  status: z.enum(["aktif", "pindah"]).default("aktif"),
});

export const IndividualSchema = z.object({
  nama: z.string().min(3, "Nama minimal 3 karakter"),
  nik: z
    .string()
    .length(16, "NIK harus 16 digit")
    .regex(/^\d+$/, "NIK hanya angka"),
  tanggal_lahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  jenis_kelamin: z.enum(["L", "P"], { required_error: "Pilih jenis kelamin" }),
  peran_dalam_kk: z.enum([
    "kepala_keluarga",
    "istri",
    "anak",
    "anggota_lain",
  ]),
  status_kb: z
    .enum(["tidak", "pil", "suntik", "iud", "implan", "lainnya"])
    .default("tidak"),
  status_hamil: z.boolean().default(false),
  perkiraan_tgl_lahir: z.string().optional().nullable(),
  pasangan_id: z.string().optional().nullable(),
  status: z.enum(["aktif", "pindah", "meninggal"]).default("aktif"),
});

export const ReportSchema = z.object({
  kategori: z.string().min(1, "Pilih kategori"),
  periode: z.string().min(1, "Periode wajib diisi"),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type HouseholdInput = z.infer<typeof HouseholdSchema>;
export type IndividualInput = z.infer<typeof IndividualSchema>;
