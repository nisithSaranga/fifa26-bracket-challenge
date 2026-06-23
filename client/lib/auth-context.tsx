"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { loginUser, registerUser, googleLogin, type AuthUser } from "./api";

/*
 * Holds the logged-in user + access token in memory, and exposes
 * login/register/logout to every component via React Context.
 *
 * The access token lives in memory only (a variable), NOT localStorage —
 * memory can't be read by injected scripts (XSS-safe). The refresh token
 * is the httpOnly cookie the server set; the browser sends it automatically.
 */

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // On first load, try to restore a session using the refresh cookie.
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (res.ok) {
          const { accessToken } = await res.json();
          setToken(accessToken);
          const meRes = await fetch(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (meRes.ok) {
            const { user } = await meRes.json();
            setUser({ id: user._id ?? user.id, username: user.username, email: user.email });
          }
        }
      } catch {
        /* no session — that's fine, user is logged out */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(emailOrUsername: string, password: string) {
    const { accessToken, user } = await loginUser({ emailOrUsername, password });
    setToken(accessToken);
    setUser(user);
  }

  async function register(username: string, email: string, password: string) {
    const { accessToken, user } = await registerUser({ username, email, password });
    setToken(accessToken);
    setUser(user);
  }

  async function loginWithGoogle(credential: string) {
    const { accessToken, user } = await googleLogin(credential);
    setToken(accessToken);
    setUser(user);
  }

  function logout() {
    fetch(`${API_URL}/api/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook every component uses: const { user, login } = useAuth(); */
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}