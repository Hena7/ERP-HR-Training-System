"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";
import { LogOut, User } from "lucide-react";

type HeaderRole =
  | "EMPLOYEE"
  | "DEPARTMENT_HEAD"
  | "HR_OFFICER"
  | "CYBER_DEVELOPMENT_CENTER"
  | "COMMITTEE_MEMBER"
  | "DIRECTOR"
  | "ADMIN";

export default function Header() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const roleLabel = (role: string) => {
    const translated = t(role as HeaderRole);
    return translated === role
      ? role
          .split("_")
          .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
          .join(" ")
      : translated;
  };

  return (
    <header className="fixed left-64 right-0 top-0 z-30 flex h-16 items-center justify-between glass-panel px-6 transition-all duration-300">
      <div className="flex items-center gap-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{t("orgName")}</h2>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <LanguageToggle />
        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-xl bg-brand-50/50 dark:bg-slate-800/50 border border-brand-100 dark:border-slate-700/50 px-4 py-1.5 shadow-sm transition-colors duration-200 hover:shadow-md">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 shadow-sm shadow-brand-200 dark:shadow-none">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none">
                  {user.fullName}
                </span>
                <span className="mt-1 text-[10px] font-bold uppercase tracking-tighter text-brand-600 dark:text-brand-400">
                  {roleLabel(user.role)}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-900/50 dark:hover:bg-red-900/20 dark:hover:text-red-400 shadow-sm hover:shadow"
            >
              <LogOut className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
              {t("logout")}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
