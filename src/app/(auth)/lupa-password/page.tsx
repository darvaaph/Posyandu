"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function LupaPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email wajib diisi");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });
      if (err) throw err;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim email reset.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <div className="text-4xl">📬</div>
        <h2 className="text-lg font-semibold">Email terkirim!</h2>
        <p className="text-sm text-muted-foreground">
          Kami mengirimkan link reset password ke{" "}
          <span className="font-medium text-foreground">{email}</span>.
          Silakan cek inbox (atau folder spam) Anda.
        </p>
        <p className="text-xs text-muted-foreground">
          Link berlaku 1 jam. Jika tidak muncul, coba kirim ulang.
        </p>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setSent(false)}
        >
          Kirim Ulang
        </Button>
        <Link
          href="/login"
          className="block text-sm text-primary underline"
        >
          Kembali ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Link
        href="/login"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Kembali
      </Link>

      <div>
        <h2 className="text-lg font-semibold">Lupa Password</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Masukkan email yang terdaftar. Kami akan mengirimkan link untuk
          membuat password baru.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div>
        <Label>Email</Label>
        <Input
          type="email"
          placeholder="email@posyandu.id"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Mengirim..." : "Kirim Link Reset"}
      </Button>
    </form>
  );
}
