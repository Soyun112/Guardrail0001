import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AuthContextValue = {
  isAuthed: boolean;
  isDemo: boolean;
  enterDemo: () => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  const enterDemo = useCallback(() => {
    setIsDemo(true);
    setIsAuthed(true);
  }, []);

  const signOut = useCallback(() => {
    setIsDemo(false);
    setIsAuthed(false);
  }, []);

  const value = useMemo(
    () => ({ isAuthed, isDemo, enterDemo, signOut }),
    [isAuthed, isDemo, enterDemo, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
