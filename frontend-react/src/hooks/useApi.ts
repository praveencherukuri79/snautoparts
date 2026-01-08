import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiError } from '@/services/api';

export interface UseApiState<T> {
  /** Response data */
  data: T | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: ApiError | null;
  /** Whether request has been made */
  isInitialized: boolean;
}

export interface UseApiOptions<T> {
  /** Initial data value */
  initialData?: T;
  /** Whether to fetch immediately on mount */
  immediate?: boolean;
  /** Dependencies that trigger refetch */
  deps?: unknown[];
  /** Callback on success */
  onSuccess?: (data: T) => void;
  /** Callback on error */
  onError?: (error: ApiError) => void;
}

export interface UseApiReturn<T, P extends unknown[]> extends UseApiState<T> {
  /** Execute the API call */
  execute: (...params: P) => Promise<T | null>;
  /** Reset state to initial */
  reset: () => void;
  /** Manually set data */
  setData: (data: T | null) => void;
  /** Refetch with last params */
  refetch: () => Promise<T | null>;
}

/**
 * useApi Hook
 * 
 * Generic hook for managing API call state with loading, error, and data handling.
 * 
 * @param apiFunction - The API function to call
 * @param options - Hook options
 * 
 * @example
 * ```tsx
 * // Basic usage
 * const { data: products, isLoading, error } = useApi(
 *   () => catalogService.getProducts(),
 *   { immediate: true }
 * );
 * 
 * // With params
 * const { data: product, execute: fetchProduct } = useApi(
 *   (id: string) => catalogService.getProduct(id)
 * );
 * 
 * useEffect(() => {
 *   fetchProduct(productId);
 * }, [productId]);
 * ```
 */
export function useApi<T, P extends unknown[] = []>(
  apiFunction: (...params: P) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T, P> {
  const {
    initialData = null,
    immediate = false,
    deps = [],
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    isLoading: immediate,
    error: null,
    isInitialized: false,
  });

  // Store last params for refetch
  const lastParamsRef = useRef<P | null>(null);
  const mountedRef = useRef(true);

  // Execute API call
  const execute = useCallback(
    async (...params: P): Promise<T | null> => {
      lastParamsRef.current = params;
      
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const data = await apiFunction(...params);
        
        if (mountedRef.current) {
          setState({
            data,
            isLoading: false,
            error: null,
            isInitialized: true,
          });
          onSuccess?.(data);
        }
        
        return data;
      } catch (error) {
        const apiError = error as ApiError;
        
        if (mountedRef.current) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: apiError,
            isInitialized: true,
          }));
          onError?.(apiError);
        }
        
        return null;
      }
    },
    [apiFunction, onSuccess, onError]
  );

  // Refetch with last params
  const refetch = useCallback(async (): Promise<T | null> => {
    if (lastParamsRef.current) {
      return execute(...lastParamsRef.current);
    }
    return execute(...([] as unknown as P));
  }, [execute]);

  // Reset state
  const reset = useCallback(() => {
    setState({
      data: initialData,
      isLoading: false,
      error: null,
      isInitialized: false,
    });
    lastParamsRef.current = null;
  }, [initialData]);

  // Manually set data
  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  // Handle immediate fetch and deps
  useEffect(() => {
    if (immediate) {
      execute(...([] as unknown as P));
    }
  }, [immediate, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    refetch,
  };
}

export default useApi;
