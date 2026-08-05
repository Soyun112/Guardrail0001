import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type LocalUser = {
  id: string;
  email: string;
};

type AuthContextValue = {
  loading: boolean;
  isAuthed: boolean;
  isGuest: boolean;
  user: LocalUser | null;
  email: string | null;
  enterGuest: () => void;
  signIn: (email: string, password: string) => { error: string | null };
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const GUEST_KEY = "guardrail_guest";
const USER_KEY = "guardrail_user";

function readStoredUser(): LocalUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LocalUser;
    if (!parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const stored = readStoredUser();
    if (stored) {
      setUser(stored);
      sessionStorage.removeItem(GUEST_KEY);
      setIsGuest(false);
    } else if (sessionStorage.getItem(GUEST_KEY) === "1") {
      setIsGuest(true);
    }
    setLoading(false);
  }, []);

  const enterGuest = useCallback(() => {
    localStorage.removeItem(USER_KEY);
    sessionStorage.setItem(GUEST_KEY, "1");
    setUser(null);
    setIsGuest(true);
  }, []);

  const signIn = useCallback((email: string, password: string) => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      return { error: "올바른 이메일을 입력하세요." };
    }
    if (!password.trim()) {
      return { error: "비밀번호를 입력하세요." };
    }
    const next: LocalUser = {
      id: `local-${trimmed.toLowerCase()}`,
      email: trimmed,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(next));
    sessionStorage.removeItem(GUEST_KEY);
    setUser(next);
    setIsGuest(false);
    return { error: null };
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(GUEST_KEY);
    setUser(null);
    setIsGuest(false);
  }, []);

  const isAuthed = Boolean(user) || isGuest;

  const value = useMemo(
    () => ({
      loading,
      isAuthed,
      isGuest,
      user,
      email: user?.email ?? null,
      enterGuest,
      signIn,
      signOut,
    }),
    [loading, isAuthed, isGuest, user, enterGuest, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
