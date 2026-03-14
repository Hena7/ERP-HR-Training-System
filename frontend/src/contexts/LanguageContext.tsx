"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Locale, t, TranslationKey } from "@/lib/i18n";

interface LanguageContextType {
  locale: Locale;
  toggleLocale: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  toggleLocale: () => {},
  t: (key: TranslationKey) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === "en" ? "am" : "en"));
  }, []);

  const translate = useCallback(
    (key: TranslationKey) => t(locale, key),
    [locale]
  );

  return (
    <LanguageContext.Provider
      value={{ locale, toggleLocale, t: translate }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
