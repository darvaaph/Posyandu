import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-accent to-background px-4 py-10">
      <div className="mb-6 text-center">
        <div className="mb-2 text-4xl">🩺</div>
        <h1 className="text-2xl font-bold text-primary">{APP_NAME}</h1>
        <p className="text-sm text-muted-foreground">
          Sistem Informasi Gizi &amp; Pencatatan Posyandu
        </p>
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm">
        {children}
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        Versi frontend-only · data tersimpan di perangkat ini
      </p>
    </div>
  );
}
