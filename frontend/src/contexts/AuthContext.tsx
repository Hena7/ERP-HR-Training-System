"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AuthResponse } from "@/types";
import {
  getKeycloakClient,
  getValidAccessToken,
  initKeycloak,
  keycloakLogin,
  keycloakLogout,
  mapTokenToUser,
} from "@/lib/keycloak";

interface AuthContextType {
  user: AuthResponse | null;
  token: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
  logout: async () => {},
  isAuthenticated: false,
  isInitializing: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      try {
        await initKeycloak();
        const mappedUser = mapTokenToUser();

        if (!isMounted) {
          return;
        }

        setUser(mappedUser);
        setToken(mappedUser?.token ?? null);

        if (mappedUser) {
          localStorage.setItem("user", JSON.stringify(mappedUser));
        } else {
          localStorage.removeItem("user");
        }
      } catch {
        if (!isMounted) {
          return;
        }

        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    const intervalId = window.setInterval(async () => {
      const refreshedToken = await getValidAccessToken(60);
      if (!refreshedToken) {
        return;
      }

      setToken(refreshedToken);
      const mappedUser = mapTokenToUser();
      if (mappedUser) {
        setUser(mappedUser);
        localStorage.setItem("user", JSON.stringify(mappedUser));
      }
    }, 30_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [token]);

  useEffect(() => {
    const client = getKeycloakClient();

    client.onAuthSuccess = () => {
      const mappedUser = mapTokenToUser();
      setUser(mappedUser);
      setToken(mappedUser?.token ?? null);
      if (mappedUser) {
        localStorage.setItem("user", JSON.stringify(mappedUser));
      }
    };

    client.onAuthLogout = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem("user");
    };

    client.onTokenExpired = async () => {
      const refreshedToken = await getValidAccessToken(60);
      if (!refreshedToken) {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
      }
    };

    return () => {
      client.onAuthSuccess = undefined;
      client.onAuthLogout = undefined;
      client.onTokenExpired = undefined;
    };
  }, []);

  const login = useCallback(async () => {
    await keycloakLogin();
  }, []);

  const logout = useCallback(async () => {
    const client = getKeycloakClient();

    try {
      await client.clearToken();
    } catch {
      // Ignore and continue with logout redirect.
    }

    setUser(null);
    setToken(null);
    localStorage.removeItem("user");

    await keycloakLogout();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        isInitializing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
