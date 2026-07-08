"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { LoginSchema, type LoginInput } from "@/lib/validation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

export function LoginForm() {
  const { login } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (d: LoginInput) => {
    setAuthError(null);
    try {
      await login(d.email, d.password);
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : "Gagal masuk");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {authError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {authError}
        </div>
      )}
      <div>
        <Label>Email</Label>
        <Input type="email" placeholder="email@posyandu.id" {...register("email")} />
        <FieldError message={errors.email?.message} />
      </div>
      <div>
        <Label>Password</Label>
        <PasswordInput placeholder="••••••" {...register("password")} />
        <FieldError message={errors.password?.message} />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        Masuk
      </Button>
      <div className="flex flex-col items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/lupa-password" className="text-primary underline">
          Lupa password?
        </Link>
        <span>
          Belum punya akun?{" "}
          <Link href="/register" className="font-medium text-primary underline">
            Daftar
          </Link>
        </span>
      </div>
    </form>
  );
}
