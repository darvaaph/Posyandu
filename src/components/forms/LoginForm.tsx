"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { LoginSchema, type LoginInput } from "@/lib/validation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";

export function LoginForm() {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "kader@posyandu.id", password: "123456" },
  });

  return (
    <form
      onSubmit={handleSubmit((d) => login(d.email, d.password))}
      className="space-y-4"
    >
      <div>
        <Label>Email</Label>
        <Input type="email" placeholder="email@posyandu.id" {...register("email")} />
        <FieldError message={errors.email?.message} />
      </div>
      <div>
        <Label>Password</Label>
        <Input type="password" placeholder="••••••" {...register("password")} />
        <FieldError message={errors.password?.message} />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        Masuk
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link href="/register" className="font-medium text-primary underline">
          Daftar
        </Link>
      </p>
    </form>
  );
}
