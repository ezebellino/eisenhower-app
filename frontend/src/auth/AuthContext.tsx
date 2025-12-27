// src/auth/AuthContext.tsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { me, logout as logoutService } from "../services/authService";
import { getToken } from "../services/api";

type Role = "user" | "supervisor";

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  role: Role;
  is_active: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  refreshMe: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshMe = async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }
    const data = await me();
    setUser(data);
  };

  const logout = () => {
    logoutService();
    setUser(null);
  };

  useEffect(() => {
    (async () => {
      try {
        await refreshMe();
      } catch {
        // token inválido / expirado
        logout();
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, refreshMe, logout }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
