"use client";

import React, { createContext, useContext } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { AuthResponse } from "@/types";

// We keep AuthProvider as a pass-through to avoid breaking imports in Providers.tsx
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useAuth() {
  const { data: session, status } = useSession();

  // Extract roles injected into the NextAuth session via the custom jwt callback
  const roles = (session as any)?.user?.roles || [];

  // Backward compatibility: Find the first relevant role that matches the old expected backend roles
  const primaryRole =
    roles.find((r: string) =>
      [
        "CYBER_DEVELOPMENT_CENTER",
        "DEPARTMENT_HEAD",
        " ",
        "COMMITTEE_MEMBER",
        "ADMIN",
        "EMPLOYEE",
      ].includes(r),
    ) ||
    roles[0] ||
    "EMPLOYEE";

  // Map standard Keycloak claims to the legacy AuthResponse object
  const user: AuthResponse | null = session
    ? {
        token: (session as any).accessToken || "",
        role: primaryRole as any,
        fullName: session.user?.name || "Keycloak User",
        email: session.user?.email || "user@example.com",
        department: (session as any).user?.department || "",
      }
    : null;

  return {
    user,
    token: (session as any)?.accessToken || null,
    login: () => signIn("keycloak", { callbackUrl: "/dashboard" }),
    logout: () => signOut({ callbackUrl: "/login" }),
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  };
}
