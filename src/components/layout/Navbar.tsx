"use client";

import Link from "next/link";
import { Bell, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useReviews } from "@/hooks/useReviews";
import { APP_NAME } from "@/lib/constants";

export function Navbar() {
  const { kader, logout } = useAuth();
  const reviews = useReviews();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl">🩺</span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">{kader?.nama_posyandu ?? APP_NAME}</p>
            <p className="text-xs text-muted-foreground">{kader?.nama_kader ?? "Kader"}</p>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/tinjauan"
            className="relative rounded-md p-2 text-muted-foreground hover:bg-accent"
            aria-label="Tinjauan"
          >
            <Bell className="h-5 w-5" />
            {reviews.length > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                {reviews.length}
              </span>
            )}
          </Link>
          <button
            onClick={logout}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent"
            aria-label="Keluar"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
