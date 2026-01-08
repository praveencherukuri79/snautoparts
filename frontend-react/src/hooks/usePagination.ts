import { useState, useCallback, useMemo } from 'react';

export interface UsePaginationOptions {
  /** Total number of items */
  totalItems: number;
  /** Items per page */
  pageSize?: number;
  /** Initial page (1-indexed) */
  initialPage?: number;
  /** Callback when page changes */
  onPageChange?: (page: number) => void;
}

export interface UsePaginationReturn {
  /** Current page (1-indexed) */
  page: number;
  /** Items per page */
  pageSize: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there's a next page */
  hasNextPage: boolean;
  /** Whether there's a previous page */
  hasPreviousPage: boolean;
  /** Go to specific page */
  goToPage: (page: number) => void;
  /** Go to next page */
  nextPage: () => void;
  /** Go to previous page */
  previousPage: () => void;
  /** Go to first page */
  firstPage: () => void;
  /** Go to last page */
  lastPage: () => void;
  /** Set page size */
  setPageSize: (size: number) => void;
  /** Start index for current page (0-indexed) */
  startIndex: number;
  /** End index for current page (exclusive) */
  endIndex: number;
  /** Page numbers for pagination UI */
  pageNumbers: number[];
}

/**
 * usePagination Hook
 * 
 * Manages pagination state and provides navigation helpers.
 * 
 * @example
 * ```tsx
 * const {
 *   page,
 *   totalPages,
 *   goToPage,
 *   nextPage,
 *   previousPage,
 *   pageNumbers
 * } = usePagination({
 *   totalItems: 100,
 *   pageSize: 10,
 *   onPageChange: fetchPage
 * });
 * ```
 */
export function usePagination(options: UsePaginationOptions): UsePaginationReturn {
  const {
    totalItems,
    pageSize: initialPageSize = 10,
    initialPage = 1,
    onPageChange,
  } = options;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  const goToPage = useCallback(
    (newPage: number) => {
      const validPage = Math.max(1, Math.min(newPage, totalPages));
      setPage(validPage);
      onPageChange?.(validPage);
    },
    [totalPages, onPageChange]
  );

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      goToPage(page + 1);
    }
  }, [hasNextPage, page, goToPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      goToPage(page - 1);
    }
  }, [hasPreviousPage, page, goToPage]);

  const firstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const lastPage = useCallback(() => {
    goToPage(totalPages);
  }, [totalPages, goToPage]);

  const setPageSize = useCallback(
    (size: number) => {
      setPageSizeState(size);
      // Reset to page 1 when page size changes
      setPage(1);
      onPageChange?.(1);
    },
    [onPageChange]
  );

  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  // Generate page numbers for UI
  const pageNumbers = useMemo(() => {
    const delta = 2; // Pages to show on each side of current
    const range: number[] = [];
    
    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(totalPages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }

    // Add first page
    if (page - delta > 2) {
      range.unshift(-1); // -1 represents ellipsis
    }
    range.unshift(1);

    // Add last page
    if (page + delta < totalPages - 1) {
      range.push(-1); // -1 represents ellipsis
    }
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  }, [page, totalPages]);

  return {
    page,
    pageSize,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    setPageSize,
    startIndex,
    endIndex,
    pageNumbers,
  };
}

export default usePagination;
