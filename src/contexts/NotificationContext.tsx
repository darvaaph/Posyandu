"use client";

import { createContext, useContext, useCallback, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { uid } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface NotificationContextType {
  toasts: Toast[];
  notify: (message: string, type?: ToastType) => void;
  dismiss: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = uid("toast_");
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), 3500);
    },
    [dismiss]
  );

  return (
    <NotificationContext.Provider value={{ toasts, notify, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </NotificationContext.Provider>
  );
}

const TOAST_CONFIG: Record<
  ToastType,
  { icon: React.ReactNode; border: string; iconBg: string }
> = {
  success: {
    icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
    border: "border-l-green-500",
    iconBg: "bg-green-50",
  },
  error: {
    icon: <XCircle className="h-4 w-4 text-red-500" />,
    border: "border-l-red-500",
    iconBg: "bg-red-50",
  },
  info: {
    icon: <Info className="h-4 w-4 text-blue-500" />,
    border: "border-l-blue-500",
    iconBg: "bg-blue-50",
  },
};

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed left-1/2 top-[4.5rem] z-[100] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2 md:left-auto md:right-6 md:translate-x-0">
      {toasts.map((t) => {
        const cfg = TOAST_CONFIG[t.type];
        return (
          <div
            key={t.id}
            className={`animate-toast-enter flex items-center gap-3 rounded-lg border border-l-4 bg-white px-4 py-3 shadow-lg ${cfg.border}`}
          >
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${cfg.iconBg}`}>
              {cfg.icon}
            </span>
            <p className="flex-1 text-sm font-medium text-foreground">{t.message}</p>
            <button
              onClick={() => onDismiss(t.id)}
              className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
              aria-label="Tutup"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
}
