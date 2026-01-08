import { createTheme } from '@mui/material/styles';
import { palette } from './palette';
import { typography } from './typography';
import { components } from './components';
import './theme.d.ts';

/**
 * Dark Theme Configuration
 * Dark mode variant
 */
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: palette.primary.main,
      dark: palette.primary.dark,
      light: palette.primary.light,
      contrastText: palette.primary.contrastText,
    },
    secondary: {
      main: palette.secondary.light,
      dark: palette.secondary.main,
      light: '#4a4a6a',
      contrastText: '#ffffff',
    },
    background: {
      default: palette.background.dark,
      paper: palette.background.surfaceDark,
      dark: palette.background.dark,
      header: palette.background.header,
      surfaceDark: palette.background.surfaceDark,
      inputDark: palette.background.inputDark,
    },
    text: {
      primary: '#ffffff',
      secondary: palette.text.muted,
      disabled: palette.border.dark,
      muted: palette.text.muted,
    },
    border: {
      light: palette.border.light,
      dark: palette.border.dark,
    },
    success: {
      main: palette.success.main,
      light: palette.success.light,
      dark: palette.success.dark,
      contrastText: palette.success.contrastText,
    },
    warning: {
      main: palette.warning.main,
      light: palette.warning.light,
      dark: palette.warning.dark,
      contrastText: palette.warning.contrastText,
    },
    error: {
      main: palette.error.main,
      light: palette.error.light,
      dark: palette.error.dark,
      contrastText: palette.error.contrastText,
    },
    info: {
      main: palette.info.main,
      light: palette.info.light,
      dark: palette.info.dark,
      contrastText: palette.info.contrastText,
    },
    grey: palette.grey,
    divider: palette.border.dark,
  },
  typography,
  components: {
    ...components,
    // Dark mode specific overrides
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: palette.background.dark,
          color: '#ffffff',
        },
      },
    },
    MuiPaper: {
      ...components.MuiPaper,
      styleOverrides: {
        ...components.MuiPaper?.styleOverrides,
        root: {
          backgroundImage: 'none',
          backgroundColor: palette.background.surfaceDark,
        },
        outlined: {
          borderColor: palette.border.dark,
        },
      },
    },
    MuiCard: {
      ...components.MuiCard,
      styleOverrides: {
        ...components.MuiCard?.styleOverrides,
        root: {
          borderRadius: '0.75rem',
          border: `1px solid ${palette.border.dark}`,
          backgroundColor: palette.background.surfaceDark,
          transition: 'all 200ms ease',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
          backgroundColor: palette.background.inputDark,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: palette.primary.main,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: palette.primary.main,
            borderWidth: 2,
          },
        },
        notchedOutline: {
          borderColor: palette.border.dark,
        },
        input: {
          padding: '0.875rem 1rem',
          color: '#ffffff',
          '&::placeholder': {
            color: palette.text.muted,
            opacity: 0.5,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: palette.text.muted,
          '&.Mui-focused': {
            color: palette.primary.main,
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: palette.border.dark,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#2d251f',
            color: palette.text.muted,
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: palette.border.dark,
          padding: '1rem',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: '0.5rem',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
          border: `1px solid ${palette.border.dark}`,
          backgroundColor: palette.background.surfaceDark,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '1rem',
          backgroundColor: palette.background.surfaceDark,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: palette.background.dark,
          borderRight: 'none',
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: palette.border.dark,
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  shadows: [
    'none',
    '0 1px 2px 0 rgb(0 0 0 / 0.1)',
    '0 1px 3px 0 rgb(0 0 0 / 0.2), 0 1px 2px -1px rgb(0 0 0 / 0.2)',
    '0 4px 6px -1px rgb(0 0 0 / 0.2), 0 2px 4px -2px rgb(0 0 0 / 0.2)',
    '0 10px 15px -3px rgb(0 0 0 / 0.2), 0 4px 6px -4px rgb(0 0 0 / 0.2)',
    '0 20px 25px -5px rgb(0 0 0 / 0.2), 0 8px 10px -6px rgb(0 0 0 / 0.2)',
    '0 25px 50px -12px rgb(0 0 0 / 0.4)',
    '0 25px 50px -12px rgb(0 0 0 / 0.4)',
    '0 25px 50px -12px rgb(0 0 0 / 0.4)',
    '0 25px 50px -12px rgb(0 0 0 / 0.4)',
    '0 25px 50px -12px rgb(0 0 0 / 0.4)',
    '0 25px 50px -12px rgb(0 0 0 / 0.4)',
    '0 25px 50px -12px rgb(0 0 0 / 0.4)',
    '0 25px 50px -12px rgb(0 0 0 / 0.4)',
    '0 25px 50px -12px rgb(0 0 0 / 0.4)',
    '0 25px 50px -12px rgb(0 0 0 / 0.4)',
    '0 25px 50px -12px rgb(0 0 0 / 0.4)',
    '0 25px 50px -12px rgb(0 0 0 / 0.4)',
    '0 25px 50px -12px rgb(0 0 0 / 0.4)',
    '0 25px 50px -12px rgb(0 0 0 / 0.4)',
    '0 25px 50px -12px rgb(0 0 0 / 0.4)',
    '0 25px 50px -12px rgb(0 0 0 / 0.4)',
    '0 25px 50px -12px rgb(0 0 0 / 0.4)',
    '0 25px 50px -12px rgb(0 0 0 / 0.4)',
    '0 25px 50px -12px rgb(0 0 0 / 0.4)',
  ],
});
