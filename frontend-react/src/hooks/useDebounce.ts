import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 * 
 * Debounces a value, returning the value only after the delay has passed
 * without the value changing.
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * 
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 300);
 * 
 * useEffect(() => {
 *   // This runs 300ms after searchTerm stops changing
 *   searchProducts(debouncedSearch);
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
