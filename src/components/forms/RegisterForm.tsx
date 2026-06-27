"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { RegisterSchema, type RegisterInput } from "@/lib/validation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";

export function RegisterForm() {
  const { register: registerKader } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
  });

  return (
    <form onSubmit={handleSubmit((d) => registerKader(d))} className="space-y-4">
      <div>
        <Label>Nama Kader</Label>
        <Input placeholder="Nama lengkap" {...register("nama_kader")} />
        <FieldError message={errors.nama_kader?.message} />
      </div>
      <div>
        <Label>Nama Posyandu</Label>
        <Input placeholder="Posyandu Melati" {...register("nama_posyandu")} />
        <FieldError message={errors.nama_posyandu?.message} />
      </div>
      <div>
        <Label>Wilayah</Label>
        <Input placeholder="Desa / Kelurahan" {...register("wilayah")} />
        <FieldError message={errors.wilayah?.message} />
      </div>
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
        Daftar
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-primary underline">
          Masuk
        </Link>
      </p>
    </form>
  );
}
