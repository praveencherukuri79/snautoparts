import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface TypeBackground {
    dark: string;
    header: string;
    surfaceDark: string;
    inputDark: string;
  }

  interface TypeText {
    muted: string;
  }

  interface Palette {
    border: {
      light: string;
      dark: string;
    };
  }

  interface PaletteOptions {
    border?: {
      light?: string;
      dark?: string;
    };
  }
}
