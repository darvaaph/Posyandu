"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ClipboardCheck, FileText, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReviews } from "@/hooks/useReviews";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, extra: ["/kategori"] },
  { href: "/rumah-tangga", label: "Data Warga", icon: Users },
  { href: "/tinjauan", label: "Tinjauan", icon: ClipboardCheck },
  { href: "/laporan", label: "Laporan", icon: FileText },
  { href: "/profil", label: "Profil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const reviews = useReviews();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card md:hidden">
      <div className="mx-auto flex max-w-5xl items-stretch justify-around">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(item.href + "/") ||
            item.extra?.some((p) => pathname.startsWith(p));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px]",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
              {item.href === "/tinjauan" && reviews.length > 0 && (
                <span className="absolute right-1/4 top-1 h-2 w-2 rounded-full bg-destructive" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
