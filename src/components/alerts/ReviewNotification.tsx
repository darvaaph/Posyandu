"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, X } from "lucide-react";
import { useReviews } from "@/hooks/useReviews";

export function ReviewNotification() {
  const reviews = useReviews();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || reviews.length === 0) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800">
      <Bell className="h-5 w-5 shrink-0" />
      <Link href="/tinjauan" className="flex-1 text-sm font-medium hover:underline">
        {reviews.length} warga perlu ditinjau bulan ini
      </Link>
      <button
        onClick={() => setDismissed(true)}
        className="rounded p-1 hover:bg-amber-100"
        aria-label="Tutup"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
