import React, { createContext, useContext, useState } from "react";

export const lightTheme = {
  dark: false,
  bg: "#F7F5F2",
  bgCard: "#FFFFFF",
  bgSubtle: "#F0EDE8",
  bgInput: "#F7F5F2",
  border: "#E8E3DC",
  borderLight: "#F0EDE8",
  text: "#1A1614",
  textSecondary: "#6B6560",
  textMuted: "#A09890",
  accent: "#2D2926",
  accentGreen: "#2A6049",
  accentGreenMuted: "#E8F2EE",
  accentPurple: "#3D2E8C",
  accentPurpleMuted: "#ECEAF8",
  accentOrange: "#C4531A",
  accentOrangeMuted: "#FDEEE6",
  tabBar: "#FFFFFF",
  tabBarBorder: "#E8E3DC",
  headerBg: "#F7F5F2",
  premium: "#B8860B",
  premiumMuted: "#FDF8E7",
};

export const darkTheme = {
  dark: true,
  bg: "#111010",
  bgCard: "#1C1B1A",
  bgSubtle: "#252422",
  bgInput: "#1C1B1A",
  border: "#2E2C2A",
  borderLight: "#252422",
  text: "#F2EFE9",
  textSecondary: "#9C9590",
  textMuted: "#5C5A58",
  accent: "#E8E0D5",
  accentGreen: "#4CAF85",
  accentGreenMuted: "#1A2E25",
  accentPurple: "#8B7FD4",
  accentPurpleMuted: "#1E1B35",
  accentOrange: "#E8824A",
  accentOrangeMuted: "#2E1E14",
  tabBar: "#1C1B1A",
  tabBarBorder: "#2E2C2A",
  headerBg: "#111010",
  premium: "#D4A017",
  premiumMuted: "#2A2410",
};

export type Theme = typeof lightTheme;

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? darkTheme : lightTheme;
  const toggleTheme = () => setIsDark(prev => !prev);
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
