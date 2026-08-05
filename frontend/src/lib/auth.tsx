import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "./supabase";

type AuthContextValue = {
  loading: boolean;
  isAuthed: boolean;
  isGuest: boolean;
  user: User | null;
  email: string | null;
  configured: boolean;
  enterGuest: () => void;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const GUEST_KEY = "guardrail_guest";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!supabase) {
        const guest = sessionStorage.getItem(GUEST_KEY) === "1";
        if (mounted) {
          setIsGuest(guest);
          setLoading(false);
        }
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      if (!data.session && sessionStorage.getItem(GUEST_KEY) === "1") {
        setIsGuest(true);
      }
      setLoading(false);

      const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
        setSession(next);
        if (next) {
          sessionStorage.removeItem(GUEST_KEY);
          setIsGuest(false);
        }
      });

      return () => {
        sub.subscription.unsubscribe();
      };
    }

    let cleanup: (() => void) | undefined;
    void init().then((fn) => {
      if (typeof fn === "function") cleanup = fn;
    });

    return () => {
      mounted = false;
      cleanup?.();
    };
  }, []);

  const enterGuest = useCallback(() => {
    sessionStorage.setItem(GUEST_KEY, "1");
    setIsGuest(true);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) {
      return {
        error:
          "Supabase가 설정되지 않았습니다. VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY를 확인하세요.",
      };
    }
    const redirectTo = `${window.location.origin}/`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    return { error: error?.message || null };
  }, []);

  const signOut = useCallback(async () => {
    sessionStorage.removeItem(GUEST_KEY);
    setIsGuest(false);
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
  }, []);

  const user = session?.user ?? null;
  const isAuthed = Boolean(user) || isGuest;

  const value = useMemo(
    () => ({
      loading,
      isAuthed,
      isGuest,
      user,
      email: user?.email ?? null,
      configured: isSupabaseConfigured,
      enterGuest,
      signInWithGoogle,
      signOut,
    }),
    [
      loading,
      isAuthed,
      isGuest,
      user,
      enterGuest,
      signInWithGoogle,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
