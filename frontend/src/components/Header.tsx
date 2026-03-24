"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
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
    <header className="fixed left-64 right-0 top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <img src="/INSA_LOGO.png" alt="INSA" className="h-8 w-8 object-contain" />
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{t("orgName")}</h2>
      </div>
      <div className="flex items-center gap-4">
        <LanguageToggle />
        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5">
              <User className="h-4 w-4 text-blue-600" />
              <div className="text-sm">
                <span className="font-medium text-blue-900">
                  {user.fullName}
                </span>
                <span className="ml-2 rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">
                  {roleLabel(user.role)}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              {t("logout")}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
