import { createTheme } from '@mui/material/styles';
import { palette } from './palette';
import { typography } from './typography';
import { components } from './components';
import './theme.d.ts';

/**
 * Light Theme Configuration
 * Default theme for customer-facing pages
 */
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: palette.primary.main,
      dark: palette.primary.dark,
      light: palette.primary.light,
      contrastText: palette.primary.contrastText,
    },
    secondary: {
      main: palette.secondary.main,
      dark: palette.secondary.dark,
      light: palette.secondary.light,
      contrastText: palette.secondary.contrastText,
    },
    background: {
      default: palette.background.default,
      paper: palette.background.paper,
      dark: palette.background.dark,
      header: palette.background.header,
      surfaceDark: palette.background.surfaceDark,
      inputDark: palette.background.inputDark,
    },
    text: {
      primary: palette.text.primary,
      secondary: palette.text.secondary,
      disabled: palette.text.disabled,
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
    divider: palette.border.light,
  },
  typography,
  components,
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  shadows: [
    'none',
    '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  ],
});
