import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getAppTheme } from '../theme/theme.js';

const ThemeContext = createContext(null);

export const CustomThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('vups_theme') || 'dark';
  });

  const [reducedMotion, setReducedMotion] = useState(() => {
    const saved = localStorage.getItem('vups_reduced_motion');
    if (saved !== null) return saved === 'true';
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;
  });

  useEffect(() => {
    localStorage.setItem('vups_theme', mode);
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('vups_reduced_motion', String(reducedMotion));
  }, [reducedMotion]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleReducedMotion = () => {
    setReducedMotion((prev) => !prev);
  };

  const muiTheme = useMemo(() => getAppTheme(mode), [mode]);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        isDark: mode === 'dark',
        toggleTheme,
        reducedMotion,
        toggleReducedMotion
      }}
    >
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within CustomThemeProvider');
  }
  return context;
};
