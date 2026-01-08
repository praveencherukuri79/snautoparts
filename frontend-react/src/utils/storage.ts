/**
 * Local Storage Utilities
 */

const STORAGE_PREFIX = 'sn_';

/**
 * Get item from localStorage with type safety
 * @param key - Storage key
 * @param defaultValue - Default value if not found
 */
export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch {
    return defaultValue;
  }
};

/**
 * Set item in localStorage
 * @param key - Storage key
 * @param value - Value to store
 */
export const setStorageItem = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

/**
 * Remove item from localStorage
 * @param key - Storage key
 */
export const removeStorageItem = (key: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

/**
 * Clear all items with our prefix from localStorage
 */
export const clearStorage = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

/**
 * Session Storage Utilities
 */

/**
 * Get item from sessionStorage with type safety
 * @param key - Storage key
 * @param defaultValue - Default value if not found
 */
export const getSessionItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = sessionStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch {
    return defaultValue;
  }
};

/**
 * Set item in sessionStorage
 * @param key - Storage key
 * @param value - Value to store
 */
export const setSessionItem = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  
  try {
    sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to sessionStorage:', error);
  }
};

/**
 * Remove item from sessionStorage
 * @param key - Storage key
 */
export const removeSessionItem = (key: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    sessionStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (error) {
    console.error('Error removing from sessionStorage:', error);
  }
};

/**
 * Storage keys constants
 */
export const STORAGE_KEYS = {
  THEME: 'theme',
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  CART: 'cart',
  RECENT_SEARCHES: 'recent_searches',
  SAVED_VEHICLES: 'saved_vehicles',
  FITMENT_SELECTION: 'fitment_selection',
} as const;
