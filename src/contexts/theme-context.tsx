import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { THEME_STORAGE_KEY } from "@/constants/app";
import type { ResolvedTheme, Theme } from "@/types";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolve(theme: Theme): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(THEME_STORAGE_KEY) as Theme | null) ?? "light",
  );
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolve(theme),
  );

  useEffect(() => {
    const applied = resolve(theme);
    setResolvedTheme(applied);
    const root = document.documentElement;
    root.classList.toggle("dark", applied === "dark");
    root.style.colorScheme = applied;
  }, [theme]);

  // React to OS changes while in "system" mode.
  useEffect(() => {
    if (theme !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const applied = getSystemTheme();
      setResolvedTheme(applied);
      document.documentElement.classList.toggle("dark", applied === "dark");
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    localStorage.setItem(THEME_STORAGE_KEY, next);
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolve(theme) === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
