"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "./LanguageToggle";
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

  const handleLogout = async () => {
    await logout();
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
    <header className="fixed left-64 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-gray-100 bg-white/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">{t("orgName")}</h2>
      </div>
      <div className="flex items-center gap-4">
        <LanguageToggle />
        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-lg bg-blue-50/50 border border-blue-100 px-4 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 shadow-sm shadow-blue-200">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-900 leading-none">
                  {user.fullName}
                </span>
                <span className="mt-1 text-[10px] font-bold uppercase tracking-tighter text-blue-600">
                  {roleLabel(user.role)}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 rounded-lg border border-gray-100 bg-white px-3 py-1.5 text-xs font-bold text-gray-500 transition-all hover:border-red-100 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-3.5 w-3.5 text-gray-400 group-hover:text-red-500" />
              {t("logout")}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
