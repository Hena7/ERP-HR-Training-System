"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-blue-950 to-black p-4">
      <div className="absolute right-6 top-6">
        <LanguageToggle />
      </div>
      <div className="w-full max-w-md rounded-xl bg-white/95 p-10 shadow-2xl backdrop-blur-sm border border-white/20">
        <div className="mb-10 text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl bg-white p-3 shadow-xl border border-blue-50">
              <img
                src="/INSA_LOGO.png"
                alt="INSA Logo"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {t("loginTitle") || "Sign In"}
          </h1>
          <p className="mt-2 text-sm font-medium text-gray-500">
            {t("loginSubtitle") || "Access the centralized ERP portal"}
          </p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-blue-600">
            {t("orgName") || "INSA"}
          </p>
        </div>

        <button
          onClick={() => login()}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-blue-600 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-blue-900/40 hover:bg-blue-700 transition-all focus:ring-4 focus:ring-blue-500/20"
        >
          <LogIn className="h-5 w-5 transition-transform group-hover:scale-110" />
          Authenticate via Keycloak
        </button>

        <p className="mt-8 text-center text-xs text-gray-400">
          Powered by NextAuth & Spring Security OAuth2
        </p>
      </div>
    </div>
  );
}
