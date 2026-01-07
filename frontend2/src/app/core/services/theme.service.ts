import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

/**
 * Theme Service
 * Manages application theme (light/dark mode).
 * Applies theme class to document.documentElement for CSS variable switching.
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  
  /** Current active theme */
  readonly theme = signal<Theme>('light');

  constructor() {
    // Apply theme class whenever it changes
    effect(() => {
      const currentTheme = this.theme();
      this.applyTheme(currentTheme);
    });
  }

  /**
   * Set theme explicitly (used by layouts)
   */
  setTheme(theme: Theme): void {
    this.theme.set(theme);
  }

  /**
   * Toggle between light and dark
   */
  toggleTheme(): void {
    this.theme.update(current => current === 'light' ? 'dark' : 'light');
  }

  /**
   * Apply theme class to document element
   */
  private applyTheme(theme: Theme): void {
    if (!this.isBrowser) return;
    
    const root = document.documentElement;
    
    // Remove both classes first
    root.classList.remove('light', 'dark');
    
    // Apply the current theme
    root.classList.add(theme);
    
    // Also set color-scheme for browser UI elements
    root.style.colorScheme = theme;
  }
}

