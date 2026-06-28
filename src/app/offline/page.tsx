"use client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <span className="text-5xl">📡</span>
      <h1 className="text-xl font-bold">Tidak ada koneksi</h1>
      <p className="text-sm text-muted-foreground">
        Periksa koneksi internet Anda, lalu muat ulang halaman.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
      >
        Muat Ulang
      </button>
    </div>
  );
}
