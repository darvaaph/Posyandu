"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

type Stage = "loading" | "form" | "success" | "invalid";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Supabase menaruh token di URL hash (#access_token=...&type=recovery).
    // Kita baca dan tukarkan secara eksplisit agar tidak bergantung pada
    // timing onAuthStateChange yang bisa lambat di Next.js App Router.
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const type = params.get("type");
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token") ?? "";

    if (type !== "recovery" || !accessToken) {
      setStage("invalid");
      return;
    }

    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ data, error }) => {
        if (error || !data.session) {
          setStage("invalid");
        } else {
          setStage("form");
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      // Keluar dari sesi recovery setelah berhasil
      await supabase.auth.signOut();
      setStage("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui password.");
    } finally {
      setLoading(false);
    }
  };

  if (stage === "loading") {
    return (
      <div className="space-y-3 py-4 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Memverifikasi link reset...</p>
      </div>
    );
  }

  if (stage === "invalid") {
    return (
      <div className="space-y-4 text-center">
        <div className="text-4xl">⛔</div>
        <h2 className="text-lg font-semibold">Link tidak valid</h2>
        <p className="text-sm text-muted-foreground">
          Link reset password sudah kedaluwarsa atau tidak valid.
          Silakan minta link baru.
        </p>
        <Button className="w-full" onClick={() => router.push("/lupa-password")}>
          Minta Link Baru
        </Button>
      </div>
    );
  }

  if (stage === "success") {
    return (
      <div className="space-y-4 text-center">
        <div className="text-4xl">✅</div>
        <h2 className="text-lg font-semibold">Password berhasil diperbarui!</h2>
        <p className="text-sm text-muted-foreground">
          Silakan masuk menggunakan password baru Anda.
        </p>
        <Button className="w-full" onClick={() => router.push("/login")}>
          Masuk Sekarang
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Buat Password Baru</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Masukkan password baru Anda di bawah ini.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div>
        <Label>Password Baru</Label>
        <PasswordInput
          placeholder="Minimal 6 karakter"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div>
        <Label>Konfirmasi Password</Label>
        <PasswordInput
          placeholder="Ulangi password baru"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Menyimpan..." : "Simpan Password Baru"}
      </Button>
    </form>
  );
}
