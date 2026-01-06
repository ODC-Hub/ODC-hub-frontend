import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "FORMATEUR" | "BOOTCAMPER";
  avatarFileId?: string;

}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch(err) {
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  const login = (user: AuthUser) => {
    setUser(user);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
