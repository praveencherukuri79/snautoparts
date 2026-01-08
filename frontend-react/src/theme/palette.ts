/**
 * Color Palette - Design Tokens from Stitch Designs
 */
export const palette = {
  primary: {
    main: '#f97415',
    dark: '#d85e0b',
    light: '#ffb380',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#1a1a2e',
    dark: '#0f0f1a',
    light: '#2d2d4a',
    contrastText: '#ffffff',
  },
  background: {
    default: '#f8f7f5',
    paper: '#ffffff',
    dark: '#23170f',
    header: '#1a1a2e',
    surfaceDark: '#181411',
    inputDark: '#27201b',
  },
  text: {
    primary: '#181411',
    secondary: '#8c725f',
    disabled: '#bba89b',
    muted: '#bba89b',
  },
  border: {
    light: '#e6dfdb',
    dark: '#55453a',
  },
  success: {
    main: '#16a34a',
    light: '#dcfce7',
    dark: '#15803d',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#f59e0b',
    light: '#fef3c7',
    dark: '#d97706',
    contrastText: '#ffffff',
  },
  error: {
    main: '#dc2626',
    light: '#fee2e2',
    dark: '#b91c1c',
    contrastText: '#ffffff',
  },
  info: {
    main: '#0284c7',
    light: '#e0f2fe',
    dark: '#0369a1',
    contrastText: '#ffffff',
  },
  grey: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  // Category colors for icons
  category: {
    blue: { main: '#3b82f6', light: '#eff6ff' },
    red: { main: '#ef4444', light: '#fef2f2' },
    green: { main: '#22c55e', light: '#f0fdf4' },
    yellow: { main: '#eab308', light: '#fefce8' },
    purple: { main: '#a855f7', light: '#faf5ff' },
    gray: { main: '#6b7280', light: '#f3f4f6' },
  },
} as const;

export type PaletteType = typeof palette;
