"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, isInitializing } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isInitializing, router]);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      await login();
    } catch {
      setError("Could not connect to Keycloak. Please check your Keycloak setup and try again.");
      setLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-blue-950 to-black p-4">
        <div className="rounded-lg bg-white/90 px-6 py-4 text-sm font-bold text-gray-700 shadow-xl">
          Checking authentication session...
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-blue-950 to-black p-4">
        <div className="rounded-lg bg-white/90 px-6 py-4 text-sm font-bold text-gray-700 shadow-xl">
          Redirecting to dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-blue-950 to-black p-4">
      <div className="absolute right-6 top-6">
        <LanguageToggle />
      </div>
      <div className="w-full max-w-md rounded-xl border border-white/20 bg-white/95 p-10 shadow-2xl backdrop-blur-sm">
        <div className="mb-10 text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl border border-blue-50 bg-white p-3 shadow-xl">
              <img
                src="/INSA_LOGO.png"
                alt="INSA Logo"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {t("loginTitle")}
          </h1>
          <p className="mt-2 text-sm font-medium text-gray-500">{t("loginSubtitle")}</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-blue-600">{t("orgName")}</p>
        </div>

        {error && (
          <div className="mb-6 animate-shake rounded-lg border border-red-100 bg-red-50 p-4 text-xs font-bold text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-xs font-medium text-blue-800">
            Authentication is managed by Keycloak. Click below to continue to secure sign-in.
          </div>

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-blue-600 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-blue-900/40 transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            <LogIn className="h-4 w-4 transition-transform group-hover:scale-110" />
            {loading ? t("loading") : "Sign in with Keycloak"}
          </button>
        </div>
      </div>
    </div>
  );
}
