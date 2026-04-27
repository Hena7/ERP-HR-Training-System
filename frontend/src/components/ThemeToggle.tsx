"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9 rounded-lg border border-transparent"></div>;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--sidebar)] text-[var(--sidebar-foreground)] shadow-sm hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-slate-800 dark:hover:text-brand-400 transition-all duration-200"
      title="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 animate-scale-in" />
      ) : (
        <Moon className="h-4 w-4 animate-scale-in" />
      )}
    </button>
  );
}
