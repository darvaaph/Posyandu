"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** Segmented control untuk berpindah antara halaman Masuk dan Daftar. */
export function AuthTabs() {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  const tab = (href: string, label: string, active: boolean) => (
    <Link
      href={href}
      className={cn(
        "rounded-lg py-2 text-center text-sm font-semibold transition",
        active
          ? "bg-card text-primary shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </Link>
  );

  return (
    <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
      {tab("/login", "Masuk", isLogin)}
      {tab("/register", "Daftar", !isLogin)}
    </div>
  );
}
