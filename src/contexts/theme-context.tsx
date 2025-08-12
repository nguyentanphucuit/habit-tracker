"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { Theme } from "@/types/habit";
import { storage } from "@/lib/storage";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  toggleSystemTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Use default theme for SSR to prevent hydration mismatch
  const [theme, setThemeState] = useState<Theme>({
    mode: "light",
    system: true,
  });
  const [mounted, setMounted] = useState(false);

  // Load theme from storage only after mounting
  useEffect(() => {
    const savedTheme = storage.getSettings().theme;
    setThemeState(savedTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;

    if (theme.system) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const updateTheme = () => {
        root.classList.toggle("dark", mediaQuery.matches);
      };

      updateTheme();
      mediaQuery.addEventListener("change", updateTheme);

      return () => mediaQuery.removeEventListener("change", updateTheme);
    } else {
      root.classList.toggle("dark", theme.mode === "dark");
    }
  }, [theme, mounted]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    const settings = storage.getSettings();
    settings.theme = newTheme;
    storage.saveSettings(settings);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme({
      ...theme,
      mode: theme.mode === "light" ? "dark" : "light",
    });
  }, [theme, setTheme]);

  const toggleSystemTheme = useCallback(() => {
    setTheme({
      ...theme,
      system: !theme.system,
    });
  }, [theme, setTheme]);

  // Provide a stable context value during SSR
  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      toggleSystemTheme,
      isDark: theme.system
        ? typeof window !== "undefined" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
        : theme.mode === "dark",
    }),
    [theme, setTheme, toggleTheme, toggleSystemTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
