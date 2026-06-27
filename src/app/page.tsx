"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/common/Common";

export default function HomePage() {
  const router = useRouter();
  const { kader, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    router.replace(kader ? "/dashboard" : "/login");
  }, [kader, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner label="Memuat SIGAP Posyandu..." />
    </div>
  );
}
