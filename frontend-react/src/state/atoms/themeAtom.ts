import { atom, AtomEffect } from 'recoil';
import type { ThemeMode } from '@/theme';

// Local storage effect for persisting state
const localStorageEffect = (key: string): AtomEffect<ThemeMode> => ({ setSelf, onSet }) => {
  if (typeof window === 'undefined') return;
  
  const savedValue = localStorage.getItem(key);
  if (savedValue != null) {
    setSelf(savedValue as ThemeMode);
  } else {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setSelf(prefersDark ? 'dark' : 'light');
  }

  onSet((newValue, _, isReset) => {
    if (isReset) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, newValue);
    }
  });
};

/**
 * Theme Atom
 * Manages the current theme mode (light/dark)
 */
export const themeAtom = atom<ThemeMode>({
  key: 'themeAtom',
  default: 'light',
  effects: [localStorageEffect('sn-theme')],
});
