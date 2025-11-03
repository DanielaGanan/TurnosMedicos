/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("usuario");
      if (raw) setUser(JSON.parse(raw));
      const rawAdmin = localStorage.getItem("is_admin");
      if (rawAdmin === "1" || rawAdmin === "true") setIsAdmin(true);
    } catch (e) {
      // Ignorar errores de parseo o storage no disponible
      void e; // evitar no-empty y no-unused-vars
    }
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem("usuario", JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
  }, []);

  const loginAdmin = useCallback(() => {
    setIsAdmin(true);
    localStorage.setItem("is_admin", "1");
  }, []);

  const logoutAdmin = useCallback(() => {
    setIsAdmin(false);
    localStorage.removeItem("is_admin");
  }, []);

  const value = useMemo(
    () => ({ user, login, logout, isAuthenticated: !!user, isAdmin, loginAdmin, logoutAdmin }),
    [user, isAdmin, login, logout, loginAdmin, logoutAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    try {
      if (import.meta?.env?.MODE !== 'production') {
        console.warn('useAuth: AuthProvider no encontrado. Usando valores por defecto.');
      }
    } catch (e) { void e; }
    return {
      user: null,
      login: () => {},
      logout: () => {},
      isAuthenticated: false,
      isAdmin: false,
      loginAdmin: () => {},
      logoutAdmin: () => {},
    };
  }
  return ctx;
}
