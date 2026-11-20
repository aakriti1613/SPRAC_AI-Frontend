import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  AUTH_EXPIRED_EVENT,
  clearToken,
  getToken,
  loginRequest,
  setToken,
  tokenIsFresh,
} from "../lib/api";

// Login is checked by the backend (POST /api/auth/login). The browser only keeps
// the signed token it gets back; no credentials live in this code.
const LEGACY_FLAG_KEY = "platform_auth"; // old client-only login flag

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      localStorage.removeItem(LEGACY_FLAG_KEY);
    } catch {
      // storage unavailable: nothing to clean up
    }
    return tokenIsFresh(getToken());
  });

  useEffect(() => {
    const onExpired = () => setIsAuthenticated(false);
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const result = await loginRequest(email, password);
      if (!result.success) return result;
      setToken(result.token);
      setIsAuthenticated(true);
      return { success: true };
    } catch {
      return { success: false, error: "Could not reach the server. Check your connection and try again." };
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
