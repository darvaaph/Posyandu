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

export function Sidebar() {
  const pathname = usePathname();
  const reviews = useReviews();

  return (
    <aside className="hidden w-56 shrink-0 md:block">
      <nav className="sticky top-20 flex flex-col gap-1">
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
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {item.href === "/tinjauan" && reviews.length > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                  {reviews.length}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
