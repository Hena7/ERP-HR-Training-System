"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

export default function LanguageToggle() {
  const { locale, toggleLocale, t } = useLanguage();

  return (
    <button
      onClick={toggleLocale}
      className="flex h-9 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--sidebar)] px-3 text-sm font-medium text-[var(--sidebar-foreground)] shadow-sm hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-slate-800 dark:hover:text-brand-400 transition-all duration-200"
      title={t("language")}
    >
      <Globe className="h-4 w-4" />
      <span>{locale === "en" ? "አማርኛ" : "English"}</span>
    </button>
  );
}
