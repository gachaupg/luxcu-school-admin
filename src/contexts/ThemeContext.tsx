import React, { createContext, useContext, useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { updateUserPreferences } from "@/redux/slices/preferencesSlice";

type Theme = "light" | "dark" | "auto";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { preferences } = useAppSelector((state) => state.preferences);
  const [isDark, setIsDark] = useState(false);

  // Get the effective theme based on user preference
  const getEffectiveTheme = (): "light" | "dark" => {
    if (preferences.theme === "auto") {
      // Auto mode: follow system preference
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    // Light or Dark mode: use the selected theme directly (force the theme)
    return preferences.theme;
  };

  // Apply theme to document
  const applyTheme = (theme: "light" | "dark") => {
    const root = document.documentElement;
    setIsDark(theme === "dark");

    if (theme === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }
  };

  // Update theme and save to preferences
  const setTheme = async (newTheme: Theme) => {
    await dispatch(updateUserPreferences({ theme: newTheme }));
    // Apply the new theme immediately
    if (newTheme === "auto") {
      // If switching to auto, follow current system preference
      const systemIsDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      applyTheme(systemIsDark ? "dark" : "light");
    } else {
      // If switching to light or dark, apply that theme directly
      applyTheme(newTheme);
    }
  };

  // Toggle between light and dark (skip auto)
  const toggleTheme = () => {
    const currentTheme = preferences.theme;
    let newTheme: Theme;

    if (currentTheme === "auto") {
      // If currently auto, switch to the opposite of current system preference
      const systemIsDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      newTheme = systemIsDark ? "light" : "dark";
    } else if (currentTheme === "light") {
      newTheme = "dark";
    } else {
      newTheme = "light";
    }

    setTheme(newTheme);
  };

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (preferences.theme === "auto") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        applyTheme(getEffectiveTheme());
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [preferences.theme]);

  // Apply theme when preferences change
  useEffect(() => {
    applyTheme(getEffectiveTheme());
  }, [preferences.theme]);

  // Apply theme on mount
  useEffect(() => {
    applyTheme(getEffectiveTheme());
  }, []);

  const value: ThemeContextType = {
    theme: preferences.theme,
    isDark,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
