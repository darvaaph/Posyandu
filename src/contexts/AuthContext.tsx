"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { store, mapKader } from "@/lib/store";
import { useNotification } from "./NotificationContext";
import type { KaderProfile } from "@/lib/types";

interface AuthState {
  kader: KaderProfile | null;
  isLoading: boolean;
}

interface RegisterPayload {
  nama_kader: string;
  nama_posyandu: string;
  wilayah: string;
  email: string;
  password: string;
}

interface AuthContextType extends AuthState {
  register: (data: RegisterPayload) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<KaderProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/** Ambil profil kader; buat bila belum ada (dari user_metadata saat register). */
async function ensureProfile(user: User): Promise<KaderProfile> {
  const { data: existing, error } = await supabase
    .from("kader_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;
  if (existing) return mapKader(existing);

  const meta = (user.user_metadata ?? {}) as Record<string, string>;
  const { data, error: insertError } = await supabase
    .from("kader_profiles")
    .insert({
      user_id: user.id,
      email: user.email,
      nama_kader: meta.nama_kader || "Kader",
      nama_posyandu: meta.nama_posyandu || "Posyandu",
      wilayah: meta.wilayah || "-",
    })
    .select()
    .single();
  if (insertError) throw insertError;
  return mapKader(data);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { notify } = useNotification();
  const [state, setState] = useState<AuthState>({
    kader: null,
    isLoading: true,
  });

  // Restore session + load data on mount
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const user = data.session?.user;
        if (user) {
          const kader = await ensureProfile(user);
          store.setKader(kader);
          await store.loadAll();
          store.startRealtime();
          if (active) setState({ kader, isLoading: false });
          return;
        }
      } catch (e) {
        console.error("[auth] restore gagal", e);
      }
      if (active) setState({ kader: null, isLoading: false });
    })();
    return () => {
      active = false;
      // Hentikan realtime jika komponen unmount (mis. hot-reload StrictMode).
      store.stopRealtime();
    };
  }, []);

  const bootstrap = useCallback(
    async (user: User) => {
      const kader = await ensureProfile(user);
      store.setKader(kader);
      await store.loadAll();
      store.startRealtime();
      setState({ kader, isLoading: false });
      router.push("/dashboard");
    },
    [router]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const { data, error } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
          data: {
            nama_kader: payload.nama_kader,
            nama_posyandu: payload.nama_posyandu,
            wilayah: payload.wilayah,
          },
        },
      });
      if (error) throw new Error(errMsg(error, "Registrasi gagal"));

      if (!data.session) {
        // Konfirmasi email aktif — profil dibuat saat login pertama
        notify(
          "Registrasi berhasil. Cek email Anda untuk konfirmasi, lalu login.",
          "info"
        );
        router.push("/login");
        return;
      }
      await bootstrap(data.user!);
      notify("Akun berhasil dibuat", "success");
    },
    [bootstrap, notify, router]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      // Lempar error agar form bisa menampilkannya inline (lihat LoginForm).
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new Error(errMsg(error, "Email atau password salah"));
      await bootstrap(data.user);
    },
    [bootstrap]
  );

  const logout = useCallback(async () => {
    // Bersihkan cache dulu agar event realtime terakhir tidak mengisi ulang state.
    store.clear();
    store.stopRealtime();
    await supabase.auth.signOut();
    setState({ kader: null, isLoading: false });
    router.push("/login");
  }, [router]);

  const updateProfile = useCallback(
    async (patch: Partial<KaderProfile>) => {
      const kader = await store.updateKader(patch);
      setState((s) => ({ ...s, kader }));
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{ ...state, register, login, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function errMsg(e: unknown, fallback: string): string {
  if (e && typeof e === "object" && "message" in e) {
    return String((e as { message: string }).message) || fallback;
  }
  return fallback;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
