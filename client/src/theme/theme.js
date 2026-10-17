import { createTheme } from '@mui/material/styles';

export const getAppTheme = (mode = 'dark') => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#00f0ff' : '#0284c7',
        light: isDark ? '#67e8f9' : '#38bdf8',
        dark: isDark ? '#0891b2' : '#0369a1',
        contrastText: '#08090f'
      },
      secondary: {
        main: isDark ? '#8b5cf6' : '#7c3aed',
        light: isDark ? '#a78bfa' : '#8b5cf6',
        dark: isDark ? '#6d28d9' : '#5b21b6',
        contrastText: '#ffffff'
      },
      background: {
        default: isDark ? '#07080e' : '#f1f5f9',
        paper: isDark ? '#0c101b' : '#ffffff'
      },
      text: {
        primary: isDark ? '#f8fafc' : '#0f172a',
        secondary: isDark ? '#94a3b8' : '#475569'
      },
      divider: isDark ? 'rgba(56, 189, 248, 0.14)' : 'rgba(15, 23, 42, 0.12)'
    },
    typography: {
      fontFamily: "'Inter', sans-serif",
      h1: {
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 800,
        letterSpacing: '-0.03em'
      },
      h2: {
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 700,
        letterSpacing: '-0.025em'
      },
      h3: {
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 700,
        letterSpacing: '-0.02em'
      },
      h4: {
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 600,
        letterSpacing: '-0.015em'
      },
      h5: {
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 600
      },
      h6: {
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 600
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
        fontFamily: "'Outfit', sans-serif"
      }
    },
    shape: {
      borderRadius: 12
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '10px 22px',
            fontSize: '0.95rem',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: 'none'
          },
          containedPrimary: {
            background: isDark
              ? 'linear-gradient(135deg, #00f0ff 0%, #38bdf8 100%)'
              : 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
            color: '#07080e',
            fontWeight: 700,
            '&:hover': {
              background: isDark
                ? 'linear-gradient(135deg, #38bdf8 0%, #00f0ff 100%)'
                : 'linear-gradient(135deg, #0369a1 0%, #1d4ed8 100%)',
              boxShadow: isDark
                ? '0 0 25px rgba(0, 240, 255, 0.45)'
                : '0 4px 18px rgba(2, 132, 199, 0.35)',
              transform: 'translateY(-1px)'
            }
          },
          outlined: {
            borderColor: isDark ? 'rgba(56, 189, 248, 0.3)' : 'rgba(15, 23, 42, 0.2)',
            color: isDark ? '#f8fafc' : '#0f172a',
            backdropFilter: 'blur(8px)',
            background: isDark ? 'rgba(12, 16, 27, 0.6)' : 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              borderColor: isDark ? '#00f0ff' : '#0284c7',
              background: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.08)',
              transform: 'translateY(-1px)'
            }
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark ? 'rgba(12, 16, 27, 0.8)' : '#ffffff',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.1)'}`
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? 'rgba(7, 8, 14, 0.85)' : 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(16px)',
            borderBottom: `1px solid ${isDark ? 'rgba(56, 189, 248, 0.14)' : 'rgba(15, 23, 42, 0.1)'}`,
            boxShadow: 'none'
          }
        }
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: isDark ? 'rgba(14, 19, 31, 0.65)' : 'rgba(248, 250, 252, 0.8)',
              borderRadius: 10,
              '& fieldset': {
                borderColor: isDark ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.18)'
              },
              '&:hover fieldset': {
                borderColor: isDark ? 'rgba(0, 240, 255, 0.5)' : 'rgba(2, 132, 199, 0.5)'
              },
              '&.Mui-focused fieldset': {
                borderColor: isDark ? '#00f0ff' : '#0284c7'
              }
            }
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600,
            fontSize: '0.8rem'
          }
        }
      }
    }
  });
};
