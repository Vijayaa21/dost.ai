import { createContext, useContext, ReactNode } from 'react';
import { useThemeStore } from '../store/themeStore';

interface ThemeContextValue {
  isDark: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ isDark, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme utility classes - centralized theme configuration
export const themeClasses = {
  // Page backgrounds
  pageBackground: {
    dark: 'bg-transparent',
    light: 'bg-transparent',
  },
  
  // Card styles
  card: {
    dark: 'bg-slate-800/80 border border-slate-700/50 backdrop-blur-sm',
    light: 'bg-white/90 border border-gray-200 shadow-sm',
  },
  
  // Text colors
  text: {
    primary: {
      dark: 'text-white',
      light: 'text-gray-800',
    },
    secondary: {
      dark: 'text-slate-300',
      light: 'text-gray-600',
    },
    muted: {
      dark: 'text-slate-400',
      light: 'text-gray-500',
    },
  },
  
  // Gradient text
  gradientText: {
    dark: 'bg-gradient-to-r from-[#f0b8a7] via-[#d99f8f] to-[#d97c6f] bg-clip-text text-transparent',
    light: 'bg-gradient-to-r from-[#d99f8f] via-[#d97c6f] to-[#c86b60] bg-clip-text text-transparent',
  },
  
  // Input fields
  input: {
    dark: 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-[#d97c6f] focus:ring-[#d97c6f]/20',
    light: 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-[#d97c6f] focus:ring-[#f6e7de]/60',
  },
  
  // Buttons
  button: {
    primary: 'bg-gradient-to-r from-[#d97c6f] to-[#c86b60] hover:from-[#c86b60] hover:to-[#b05b52] text-white shadow-lg shadow-[#d97c6f]/30',
    secondary: {
      dark: 'bg-slate-700 hover:bg-slate-600 text-slate-200',
      light: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    },
  },
  
  // Borders
  border: {
    dark: 'border-slate-700/50',
    light: 'border-gray-200',
  },
  
  // Shadows
  shadow: {
    dark: 'shadow-lg shadow-black/20',
    light: 'shadow-lg shadow-gray-200/50',
  },
};

// Helper function to get theme-aware class
export function getThemeClass(isDark: boolean, classObj: { dark: string; light: string }): string {
  return isDark ? classObj.dark : classObj.light;
}

// Common component class getters
export const getCardClass = (isDark: boolean, extraClasses: string = ''): string => {
  const base = isDark ? themeClasses.card.dark : themeClasses.card.light;
  return extraClasses ? `${base} ${extraClasses}` : base;
};

export const getTextClass = (isDark: boolean, type: 'primary' | 'secondary' | 'muted' = 'primary'): string => {
  return isDark ? themeClasses.text[type].dark : themeClasses.text[type].light;
};

export const getInputClass = (isDark: boolean, extraClasses: string = ''): string => {
  const base = isDark ? themeClasses.input.dark : themeClasses.input.light;
  return extraClasses ? `${base} ${extraClasses}` : base;
};

export const getGradientTextClass = (isDark: boolean): string => {
  return isDark ? themeClasses.gradientText.dark : themeClasses.gradientText.light;
};

export const getBorderClass = (isDark: boolean): string => {
  return isDark ? themeClasses.border.dark : themeClasses.border.light;
};
