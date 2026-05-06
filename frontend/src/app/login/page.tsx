"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { authApi } from "@/lib/api";
import LanguageToggle from "@/components/LanguageToggle";
import { GraduationCap, LogIn } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authApi.login(email, password);
      login(response.data);
      router.push("/dashboard");
    } catch {
      setError(t("invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

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
            {t("loginTitle")}
          </h1>
          <p className="mt-2 text-sm font-medium text-gray-500">{t("loginSubtitle")}</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-blue-600">{t("orgName")}</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-100 p-4 text-xs font-bold text-red-600 animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">
              {t("email")} {t("or")} {t("username")}
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              placeholder="Username or email address"
            />
          </div>
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-500">
              {t("password")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-blue-600 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-blue-900/40 hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            <LogIn className="h-4 w-4 transition-transform group-hover:scale-110" />
            {loading ? t("loading") : t("login")}
          </button>
        </form>
      </div>
    </div>
  );
}
