import { useState, useEffect, useRef } from 'react';

interface UseLocalStorageOptions<T> {
  /** Serialize function */
  serialize?: (value: T) => string;
  /** Deserialize function */
  deserialize?: (value: string) => T;
}

/**
 * useLocalStorage Hook
 * 
 * Syncs state with localStorage, persisting across page reloads.
 * 
 * @param key - localStorage key
 * @param initialValue - Initial value if key doesn't exist
 * @param options - Serialization options
 * 
 * @example
 * ```tsx
 * const [theme, setTheme] = useLocalStorage('theme', 'light');
 * const [user, setUser] = useLocalStorage<User | null>('user', null);
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: UseLocalStorageOptions<T>
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const serialize = options?.serialize ?? JSON.stringify;
  const deserialize = options?.deserialize ?? JSON.parse;

  // Get initial value from storage or use default
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? deserialize(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Keep ref to detect external changes
  const valueRef = useRef(storedValue);

  // Update localStorage when value changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      window.localStorage.setItem(key, serialize(storedValue));
      valueRef.current = storedValue;
    } catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error);
    }
  }, [key, storedValue, serialize]);

  // Listen for changes from other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          const newValue = deserialize(e.newValue);
          if (newValue !== valueRef.current) {
            setStoredValue(newValue);
          }
        } catch {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, deserialize]);

  // Setter function that accepts value or updater function
  const setValue = (value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const newValue = value instanceof Function ? value(prev) : value;
      return newValue;
    });
  };

  // Remove from storage
  const removeValue = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
    setStoredValue(initialValue);
  };

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
