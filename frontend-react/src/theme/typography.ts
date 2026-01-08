import { TypographyOptions } from '@mui/material/styles/createTypography';

/**
 * Typography Configuration
 * Based on Inter font family from Stitch designs
 */
export const typography: TypographyOptions = {
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  
  h1: {
    fontSize: '3rem',      // 48px
    fontWeight: 900,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '2.25rem',   // 36px
    fontWeight: 700,
    lineHeight: 1.25,
    letterSpacing: '-0.015em',
  },
  h3: {
    fontSize: '1.875rem',  // 30px
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h4: {
    fontSize: '1.5rem',    // 24px
    fontWeight: 700,
    lineHeight: 1.35,
  },
  h5: {
    fontSize: '1.25rem',   // 20px
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h6: {
    fontSize: '1rem',      // 16px
    fontWeight: 600,
    lineHeight: 1.5,
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: '1rem',      // 16px
    fontWeight: 400,
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',  // 14px
    fontWeight: 400,
    lineHeight: 1.5,
  },
  caption: {
    fontSize: '0.75rem',   // 12px
    fontWeight: 400,
    lineHeight: 1.5,
  },
  overline: {
    fontSize: '0.75rem',
    fontWeight: 600,
    lineHeight: 1.5,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: 700,
    lineHeight: 1.5,
    textTransform: 'none', // Don't uppercase buttons
  },
};
