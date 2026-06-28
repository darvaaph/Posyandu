import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  KKExtractionSchema,
  ALLOWED_KK_MEDIA,
  MAX_KK_IMAGE_BYTES,
  type KKMediaType,
} from "@/lib/kk-schema";

export const runtime = "nodejs";
export const maxDuration = 60;

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const SYSTEM_PROMPT = `Anda adalah asisten yang mengekstrak data dari foto Kartu Keluarga (KK) Indonesia.
Aturan:
- Kembalikan HANYA data yang benar-benar terbaca pada gambar. Jangan mengarang.
- Jika sebuah field tidak terbaca/tidak ada, isi null (no_kk/dusun/rt/rw) atau string kosong.
- JANGAN menebak digit NIK. Tulis sebaik mungkin tanpa mengarang.
- tanggal_lahir gunakan format YYYY-MM-DD.
- jenis_kelamin: "L" untuk laki-laki, "P" untuk perempuan.
- hubungan: salin apa adanya dari kolom "Status Hubungan Dalam Keluarga" (mis. "KEPALA KELUARGA", "ISTRI", "ANAK").
- Sertakan SEMUA anggota keluarga yang tercantum.`;

// Skema respons format Gemini (subset OpenAPI; tipe huruf besar).
const GEMINI_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    no_kk: { type: "STRING", nullable: true },
    alamat: { type: "STRING" },
    dusun: { type: "STRING", nullable: true },
    rt: { type: "STRING", nullable: true },
    rw: { type: "STRING", nullable: true },
    nama_kepala_keluarga: { type: "STRING" },
    anggota: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          nama: { type: "STRING" },
          nik: { type: "STRING" },
          tanggal_lahir: { type: "STRING" },
          jenis_kelamin: { type: "STRING", enum: ["L", "P"] },
          hubungan: { type: "STRING" },
        },
        required: ["nama", "nik", "tanggal_lahir", "jenis_kelamin", "hubungan"],
      },
    },
  },
  required: ["alamat", "nama_kepala_keluarga", "anggota"],
};

interface ExtractBody {
  image?: string; // base64 (tanpa prefix data URI)
  mediaType?: string;
}

export async function POST(req: NextRequest) {
  // 1) Pastikan env tersedia
  const apiKey = process.env.GEMINI_API_KEY;
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!apiKey || !supaUrl || !supaAnon) {
    return NextResponse.json(
      { error: "Server belum dikonfigurasi (GEMINI_API_KEY / Supabase env)." },
      { status: 500 }
    );
  }

  // 2) Verifikasi sesi: hanya kader yang login boleh memakai endpoint ini
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }
  const supabase = createClient(supaUrl, supaAnon);
  const { data: userData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !userData.user) {
    return NextResponse.json({ error: "Sesi tidak valid" }, { status: 401 });
  }

  // 3) Ambil & validasi gambar
  let body: ExtractBody;
  try {
    body = (await req.json()) as ExtractBody;
  } catch {
    return NextResponse.json({ error: "Body bukan JSON valid" }, { status: 400 });
  }

  const { image, mediaType } = body;
  if (!image || !mediaType) {
    return NextResponse.json(
      { error: "Field 'image' (base64) dan 'mediaType' wajib ada" },
      { status: 400 }
    );
  }
  if (!ALLOWED_KK_MEDIA.includes(mediaType as KKMediaType)) {
    return NextResponse.json(
      { error: `Tipe gambar tidak didukung. Pakai: ${ALLOWED_KK_MEDIA.join(", ")}` },
      { status: 400 }
    );
  }
  const approxBytes = Math.floor((image.length * 3) / 4);
  if (approxBytes > MAX_KK_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "Ukuran gambar terlalu besar (maks 8MB). Kompres dulu." },
      { status: 413 }
    );
  }

  // 4) Panggil Gemini (vision + structured output via REST)
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          {
            parts: [
              { inlineData: { mimeType: mediaType, data: image } },
              { text: "Ekstrak header KK dan SELURUH anggota keluarga dari gambar ini." },
            ],
          },
        ],
        generationConfig: {
          temperature: 0,
          responseMimeType: "application/json",
          responseSchema: GEMINI_RESPONSE_SCHEMA,
        },
      }),
    });

    const payload = await res.json();
    if (!res.ok) {
      const msg = payload?.error?.message || "Permintaan ke Gemini gagal.";
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    const text: string | undefined =
      payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      const blocked = payload?.promptFeedback?.blockReason;
      return NextResponse.json(
        {
          error: blocked
            ? `Gambar ditolak (${blocked}). Coba foto lain.`
            : "Gagal membaca KK. Coba foto yang lebih jelas.",
        },
        { status: 422 }
      );
    }

    // Validasi & normalisasi hasil; tetap kirim best-effort jika sebagian tak cocok
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Gemini mengembalikan format tidak terbaca. Coba foto yang lebih jelas." },
        { status: 422 }
      );
    }
    const result = KKExtractionSchema.safeParse(parsedJson);
    const data = result.success ? result.data : parsedJson;

    // 5) Gambar dibuang otomatis (hanya di memori request ini; tidak disimpan/di-log).
    return NextResponse.json({ data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ekstraksi gagal. Coba lagi.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
