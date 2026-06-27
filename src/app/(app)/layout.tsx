"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { LoadingSpinner } from "@/components/common/Common";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { kader, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !kader) {
      router.replace("/login");
    }
  }, [kader, isLoading, router]);

  if (isLoading || !kader) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto flex max-w-5xl gap-6 px-4 py-5">
        <Sidebar />
        <main className="min-w-0 flex-1 pb-24 md:pb-6">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
