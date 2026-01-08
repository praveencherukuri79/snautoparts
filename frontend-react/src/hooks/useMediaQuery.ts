import { useState, useEffect } from 'react';
import { useTheme, useMediaQuery as useMuiMediaQuery, Breakpoint } from '@mui/material';

/**
 * useMediaQuery Hook
 * 
 * Convenience hook for responsive design using MUI breakpoints.
 * 
 * @example
 * ```tsx
 * const { isMobile, isTablet, isDesktop, isUp, isDown } = useMediaQuery();
 * 
 * if (isMobile) {
 *   return <MobileView />;
 * }
 * return <DesktopView />;
 * ```
 */
export function useMediaQuery() {
  const theme = useTheme();

  const isXs = useMuiMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMuiMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMuiMediaQuery(theme.breakpoints.only('md'));
  const isLg = useMuiMediaQuery(theme.breakpoints.only('lg'));
  const isXl = useMuiMediaQuery(theme.breakpoints.only('xl'));

  const isMobile = useMuiMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMuiMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMuiMediaQuery(theme.breakpoints.up('md'));

  // Helper functions for custom breakpoints
  const isUp = (breakpoint: Breakpoint) => useMuiMediaQuery(theme.breakpoints.up(breakpoint));
  const isDown = (breakpoint: Breakpoint) => useMuiMediaQuery(theme.breakpoints.down(breakpoint));

  return {
    // Exact breakpoints
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    // Grouped
    isMobile,
    isTablet,
    isDesktop,
    // Helpers
    isUp,
    isDown,
    // Current breakpoint
    current: isXs ? 'xs' : isSm ? 'sm' : isMd ? 'md' : isLg ? 'lg' : 'xl',
  };
}

/**
 * useWindowSize Hook
 * 
 * Returns current window dimensions, updating on resize.
 * 
 * @example
 * ```tsx
 * const { width, height } = useWindowSize();
 * ```
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

export default useMediaQuery;
