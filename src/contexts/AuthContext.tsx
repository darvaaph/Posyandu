"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { store } from "@/lib/store";
import { uid } from "@/lib/utils";
import type { KaderProfile } from "@/lib/types";

const SESSION_KEY = "sigap_session_v1";

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
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    kader: null,
    isLoading: true,
  });

  // Restore session on mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (raw) {
        const kader = JSON.parse(raw) as KaderProfile;
        store.setKader(kader);
        setState({ kader, isLoading: false });
        return;
      }
    } catch {
      /* ignore */
    }
    setState({ kader: null, isLoading: false });
  }, []);

  const persistSession = (kader: KaderProfile | null) => {
    if (kader) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(kader));
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
  };

  const register = useCallback(
    async (data: RegisterPayload) => {
      // Frontend-only: create a local kader profile
      const kader: KaderProfile = {
        id: uid("kader_"),
        nama_kader: data.nama_kader,
        nama_posyandu: data.nama_posyandu,
        wilayah: data.wilayah,
        email: data.email,
        created_at: new Date().toISOString(),
      };
      store.setKader(kader);
      persistSession(kader);
      setState({ kader, isLoading: false });
      router.push("/dashboard");
    },
    [router]
  );

  const login = useCallback(
    async (email: string, _password: string) => {
      // Frontend-only: accept any credentials, reuse existing kader if present
      const existing = store.getSnapshot().kader;
      const kader: KaderProfile =
        existing && existing.email === email
          ? existing
          : {
              id: uid("kader_"),
              nama_kader: existing?.nama_kader ?? "Kader Posyandu",
              nama_posyandu: existing?.nama_posyandu ?? "Posyandu Melati",
              wilayah: existing?.wilayah ?? "Desa Sukamaju",
              email,
              created_at: new Date().toISOString(),
            };
      store.setKader(kader);
      persistSession(kader);
      setState({ kader, isLoading: false });
      router.push("/dashboard");
    },
    [router]
  );

  const logout = useCallback(() => {
    persistSession(null);
    store.setKader(null);
    setState({ kader: null, isLoading: false });
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ ...state, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
