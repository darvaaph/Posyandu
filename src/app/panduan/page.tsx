"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { Card } from "@/components/ui/card";

interface Section {
  id: string;
  icon: string;
  title: string;
  body: React.ReactNode;
}

const SECTIONS: Section[] = [
  {
    id: "install",
    icon: "📱",
    title: "Memasang aplikasi di HP",
    body: (
      <div className="space-y-3">
        <p>Aplikasi bisa dipasang di layar utama HP tanpa Play Store / App Store.</p>
        <div>
          <p className="font-medium text-foreground">Android (Chrome)</p>
          <ol className="ml-4 list-decimal space-y-0.5">
            <li>Buka aplikasi di Google Chrome.</li>
            <li>Ketuk menu titik tiga (⋮) di kanan atas.</li>
            <li>Pilih &quot;Tambahkan ke Layar utama&quot; / &quot;Instal aplikasi&quot;.</li>
          </ol>
        </div>
        <div>
          <p className="font-medium text-foreground">iPhone / iPad (Safari)</p>
          <ol className="ml-4 list-decimal space-y-0.5">
            <li>Buka aplikasi di Safari.</li>
            <li>Ketuk tombol Bagikan (kotak dengan panah ke atas).</li>
            <li>Pilih &quot;Tambahkan ke Layar Utama&quot;.</li>
          </ol>
        </div>
      </div>
    ),
  },
  {
    id: "akun",
    icon: "🔑",
    title: "Daftar, masuk & lupa password",
    body: (
      <div className="space-y-2">
        <p><span className="font-medium text-foreground">Daftar:</span> di kartu masuk pilih tab Daftar, isi nama kader, nama posyandu, wilayah, email, dan password (min. 6 karakter).</p>
        <p><span className="font-medium text-foreground">Masuk:</span> isi email & password. Ketuk ikon mata untuk melihat password.</p>
        <p><span className="font-medium text-foreground">Lupa password:</span> ketuk &quot;Lupa password?&quot; → masukkan email → buka email (cek folder Spam) → klik link → buat password baru.</p>
        <p className="text-xs">🔒 Setiap kader hanya melihat datanya sendiri.</p>
      </div>
    ),
  },
  {
    id: "tambah",
    icon: "➕",
    title: "Menambah data warga",
    body: (
      <div className="space-y-3">
        <div>
          <p className="font-medium text-foreground">Pakai foto KK (lebih cepat)</p>
          <ol className="ml-4 list-decimal space-y-0.5">
            <li>Data Warga → Tambah → &quot;Ambil Foto&quot; atau &quot;Unggah Gambar&quot;.</li>
            <li>Aplikasi baca semua anggota dari foto KK.</li>
            <li>Cek hasilnya. Ada peringatan ⚠️ tanggal lahir vs NIK? Ketuk &quot;Pakai&quot; atau betulkan sendiri.</li>
            <li>Isi Nomor Rumah, lalu ketuk &quot;Simpan Semua&quot;.</li>
          </ol>
          <p className="mt-1 text-xs">📌 Foto tidak tersimpan di aplikasi. Cek hasilnya dulu karena bisa ada yang kurang tepat.</p>
        </div>
        <div>
          <p className="font-medium text-foreground">Ketik sendiri</p>
          <p>Scroll ke bawah, ada pilihan isi manual. Tambah anggota satu per satu. Kategori langsung muncul begitu tanggal lahir diisi.</p>
        </div>
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Jika foto bukan KK atau buram, muncul pesan &quot;Gambar tidak dikenali sebagai Kartu Keluarga&quot;. Foto ulang dengan jelas.
        </p>
      </div>
    ),
  },
  {
    id: "kategori",
    icon: "🏷️",
    title: "Kategori sasaran otomatis",
    body: (
      <div className="space-y-2">
        <p>Kategori ditentukan otomatis dari tanggal lahir, jenis kelamin, status hamil & pasangan:</p>
        <ul className="space-y-0.5">
          <li>🍼 <b>Bayi</b> — &lt; 12 bulan</li>
          <li>🚶 <b>Batita</b> — 1–2 tahun</li>
          <li>🧒 <b>Balita</b> — 3–4 tahun</li>
          <li>👦 <b>Remaja</b> — 10–18 tahun</li>
          <li>👩 <b>WUS</b> — perempuan 15–49 tahun</li>
          <li>🤰 <b>Ibu Hamil</b> — WUS yang hamil</li>
          <li>👫 <b>PUS</b> — punya pasangan, usia 15–49 (suami & istri)</li>
          <li>👴 <b>Lansia</b> — 60 tahun ke atas</li>
        </ul>
        <p className="text-xs">Satu warga bisa masuk beberapa kategori. Ketuk kartu kategori di Dashboard untuk melihat & mengekspor daftarnya.</p>
      </div>
    ),
  },
  {
    id: "tinjauan",
    icon: "✅",
    title: "Tinjauan bulanan",
    body: (
      <p>
        Warga bisa ganti kategori tiap bulan, misalnya bayi yang sudah 1 tahun jadi batita. Menu Tinjauan menampilkan siapa saja yang berubah. Ketuk &quot;Konfirmasi&quot; per orang, atau langsung &quot;Konfirmasi Semua&quot;. Ada progress bar untuk lihat sudah berapa yang selesai.
      </p>
    ),
  },
  {
    id: "laporan",
    icon: "📄",
    title: "Membuat & mengekspor laporan",
    body: (
      <ol className="ml-4 list-decimal space-y-0.5">
        <li>Laporan → Generate.</li>
        <li>Pilih kategori (atau Semua Warga) & periode.</li>
        <li>Ketuk Pratinjau untuk melihat data.</li>
        <li>Ekspor ke <b>PDF</b> (tampilan cetak) atau <b>Excel/CSV</b>.</li>
      </ol>
    ),
  },
  {
    id: "offline",
    icon: "📡",
    title: "Butuh internet?",
    body: (
      <div className="space-y-2">
        <p>
          <b>Ya.</b> Aplikasi membutuhkan koneksi internet untuk <b>login dan semua data</b> — karena data tersimpan di server, bukan di HP.
        </p>
        <p>
          Saat tidak ada internet, aplikasi hanya menampilkan halaman &quot;Tidak ada koneksi&quot;. Penggunaan penuh tanpa internet (offline) adalah <b>rencana pengembangan</b> ke depan.
        </p>
        <p className="text-xs">Pastikan HP terhubung internet saat mau login atau simpan data.</p>
      </div>
    ),
  },
  {
    id: "tips",
    icon: "💡",
    title: "Tips foto KK & masalah umum",
    body: (
      <div className="space-y-2">
        <p className="font-medium text-foreground">Biar hasilnya akurat:</p>
        <ul className="ml-4 list-disc space-y-0.5">
          <li>Foto di tempat terang, hindari bayangan & pantulan.</li>
          <li>Posisikan KK lurus & penuhi bingkai.</li>
          <li>Selalu periksa hasil sebelum menyimpan.</li>
        </ul>
        <p className="font-medium text-foreground">Masalah umum:</p>
        <ul className="ml-4 list-disc space-y-0.5">
          <li>&quot;NIK harus 16 digit&quot; → NIK tepat 16 angka tanpa spasi.</li>
          <li>&quot;Nomor rumah sudah terdaftar&quot; → pakai nomor berbeda.</li>
          <li>Email reset tak masuk → cek Spam, pastikan ejaan email benar.</li>
        </ul>
      </div>
    ),
  },
];

export default function PanduanPage() {
  const router = useRouter();
  const [open, setOpen] = useState<string | null>("install");

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </button>

        <div className="mt-3 mb-4">
          <h1 className="text-xl font-bold">Panduan Penggunaan</h1>
          <p className="text-sm text-muted-foreground">
            Ketuk bagian di bawah untuk membuka.
          </p>
        </div>

        <div className="space-y-2">
          {SECTIONS.map((s) => {
            const isOpen = open === s.id;
            return (
              <Card key={s.id} className="overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : s.id)}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <span className="text-xl">{s.icon}</span>
                  <span className="flex-1 font-medium">{s.title}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
                    {s.body}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
