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
  // Ignore preferences and always use light mode
  const [isDark, setIsDark] = useState(false);

  // Always return 'light' as the effective theme
  const getEffectiveTheme = (): "light" => {
    return "light";
  };

  // Apply theme to document
  const applyTheme = (theme: "light") => {
    const root = document.documentElement;
    setIsDark(false);
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
  };

  // Update theme (noop, always light)
  const setTheme = async (_newTheme: Theme) => {
    applyTheme("light");
  };

  // Toggle theme (noop, always light)
  const toggleTheme = () => {
    applyTheme("light");
  };

  // Remove system theme listener (not needed)

  // Apply theme on mount
  useEffect(() => {
    applyTheme("light");
  }, []);

  const value: ThemeContextType = {
    theme: "light",
    isDark: false,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
