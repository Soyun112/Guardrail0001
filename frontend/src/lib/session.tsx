import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type SessionContextValue = {
  projectInput: string;
  setProjectInput: (v: string) => void;
  reset: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [projectInput, setProjectInput] = useState("");

  const reset = useCallback(() => {
    setProjectInput("");
  }, []);

  const value = useMemo(
    () => ({ projectInput, setProjectInput, reset }),
    [projectInput, reset],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
