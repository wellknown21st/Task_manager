import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ApiError, AuthApi, type User } from "./api";

type AuthState =
  | { status: "loading" }
  | { status: "anonymous" }
  | { status: "authed"; user: User };

type AuthMethods = {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

export type AuthContextValue =
  | (AuthMethods & { status: "loading" })
  | (AuthMethods & { status: "anonymous" })
  | (AuthMethods & { status: "authed"; user: User });

const Ctx = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  const refreshMe = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setState({ status: "anonymous" });
      return;
    }
    try {
      const user = await AuthApi.me();
      setState({ status: "authed", user });
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        localStorage.removeItem("token");
        setState({ status: "anonymous" });
        return;
      }
      console.error(e);
      setState({ status: "anonymous" });
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await AuthApi.login({ email, password });
    localStorage.setItem("token", res.token);
    setState({ status: "authed", user: res.user });
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await AuthApi.register({ name, email, password });
      localStorage.setItem("token", res.token);
      setState({ status: "authed", user: res.user });
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setState({ status: "anonymous" });
  }, []);

  const value = useMemo(
    (): AuthContextValue => ({
      login,
      register,
      logout,
      refreshMe,
      ...state,
    }),
    [login, logout, refreshMe, register, state]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside provider");
  return v;
}
