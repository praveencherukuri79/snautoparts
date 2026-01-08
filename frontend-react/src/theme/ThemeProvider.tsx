import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { useRecoilState } from 'recoil';
import { lightTheme } from './lightTheme';
import { darkTheme } from './darkTheme';
import { themeAtom } from '@/state/atoms/themeAtom';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Theme Provider Component
 * Provides theme context and MUI theme to the application
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useRecoilState(themeAtom);

  const theme = useMemo(() => {
    return mode === 'dark' ? darkTheme : lightTheme;
  }, [mode]);

  const toggleTheme = useCallback(() => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, [setMode]);

  const setTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
  }, [setMode]);

  // Update data-theme attribute on document for CSS variable support
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(mode);
  }, [mode]);

  const contextValue = useMemo<ThemeContextValue>(() => ({
    mode,
    toggleTheme,
    setTheme,
  }), [mode, toggleTheme, setTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access theme context
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
