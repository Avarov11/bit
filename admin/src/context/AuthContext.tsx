"use client";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthState { username: string; role: "admin" | "readonly"; isReadOnly: boolean; }
const AuthContext = createContext<AuthState>({ username: "", role: "admin", isReadOnly: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ username: "", role: "admin", isReadOnly: false });

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then(r => r.json())
      .then((data: { username?: string; role?: string }) => {
        if (data.role) {
          const role = data.role as "admin" | "readonly";
          setAuth({ username: data.username ?? "", role, isReadOnly: role === "readonly" });
        }
      })
      .catch(() => {});
  }, []);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
