// Uji ekstraksi KK langsung ke Google Gemini (tanpa lewat route/auth) untuk
// memvalidasi kualitas hasil sebelum membangun UI.
//
// Pakai:
//   1. Isi GEMINI_API_KEY di .env.local (gratis: https://aistudio.google.com/apikey)
//   2. node scripts/test-extract-kk.mjs path/ke/foto-kk.jpg
//
// PRIVASI: untuk uji, pakai KK contoh/dummy — bukan data warga asli
// (free tier Gemini bisa memakai data untuk melatih model).

import fs from "node:fs";
import path from "node:path";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const MEDIA = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

const SYSTEM_PROMPT =
  "Anda mengekstrak data dari foto Kartu Keluarga (KK) Indonesia. " +
  "Kembalikan hanya yang terbaca jelas; jangan menebak NIK. " +
  "tanggal_lahir format YYYY-MM-DD; jenis_kelamin L/P; sertakan SEMUA anggota.";

const RESPONSE_SCHEMA = {
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

function loadKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try {
    const env = fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8");
    const line = env.split(/\r?\n/).find((l) => l.startsWith("GEMINI_API_KEY="));
    return line ? line.slice("GEMINI_API_KEY=".length).trim() : "";
  } catch {
    return "";
  }
}

async function main() {
  const apiKey = loadKey();
  if (!apiKey) {
    console.error("GEMINI_API_KEY belum diisi (env atau .env.local).");
    process.exit(1);
  }
  const imgPath = process.argv[2];
  if (!imgPath) {
    console.error("Pakai: node scripts/test-extract-kk.mjs path/ke/foto-kk.jpg");
    process.exit(1);
  }
  const ext = path.extname(imgPath).toLowerCase();
  const mediaType = MEDIA[ext];
  if (!mediaType) {
    console.error(`Ekstensi tidak didukung (${ext}). Pakai jpg/png/webp.`);
    process.exit(1);
  }

  const data = fs.readFileSync(imgPath).toString("base64");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  console.log(`Mengekstrak (${MODEL})...`, path.basename(imgPath));
  const t0 = Date.now();
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [
        {
          parts: [
            { inlineData: { mimeType: mediaType, data } },
            { text: "Ekstrak header KK dan SELURUH anggota keluarga." },
          ],
        },
      ],
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    }),
  });

  const payload = await res.json();
  if (!res.ok) {
    console.error("GAGAL:", payload?.error?.message || res.status);
    process.exit(1);
  }
  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  console.log(`Selesai dalam ${((Date.now() - t0) / 1000).toFixed(1)}s\n`);
  console.log(text ? JSON.stringify(JSON.parse(text), null, 2) : JSON.stringify(payload, null, 2));
}

main().catch((e) => {
  console.error("GAGAL:", e.message);
  process.exit(1);
});
