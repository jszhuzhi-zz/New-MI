/**
 * Pagination helper utilities for the Link REIT membership system.
 * Works with the PaginationQuery and PaginatedResponse types from @link-reit/types.
 */

import type { PaginationQuery, PaginatedResponse } from '@link-reit/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default page size */
export const DEFAULT_PAGE_SIZE = 20;

/** Maximum allowed page size to prevent excessive queries */
export const MAX_PAGE_SIZE = 100;

/** Minimum page number */
export const MIN_PAGE = 1;

// ---------------------------------------------------------------------------
// Pagination query helpers
// ---------------------------------------------------------------------------

/**
 * Create a validated PaginationQuery with sensible defaults.
 * Clamps page and pageSize to valid ranges.
 *
 * @param partial - Partial pagination options from user input.
 */
export function createPaginationQuery(
  partial?: Partial<PaginationQuery>,
): PaginationQuery {
  const page = Math.max(MIN_PAGE, Math.floor(partial?.page ?? MIN_PAGE));
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(partial?.pageSize ?? DEFAULT_PAGE_SIZE)),
  );

  return {
    page,
    pageSize,
    sortBy: partial?.sortBy,
    sortOrder: partial?.sortOrder ?? 'desc',
  };
}

/**
 * Calculate the SQL/ORM-style offset from a PaginationQuery.
 */
export function getOffset(query: PaginationQuery): number {
  return (query.page - 1) * query.pageSize;
}

/**
 * Calculate the SQL LIMIT value from a PaginationQuery.
 */
export function getLimit(query: PaginationQuery): number {
  return query.pageSize;
}

/**
 * Convert a PaginationQuery to skip/take format used by Prisma.
 */
export function toSkipTake(query: PaginationQuery): { skip: number; take: number } {
  return {
    skip: getOffset(query),
    take: query.pageSize,
  };
}

/**
 * Build the Prisma orderBy clause from a PaginationQuery.
 * Returns undefined if no sortBy is specified.
 */
export function toOrderBy(
  query: PaginationQuery,
): Record<string, 'asc' | 'desc'> | undefined {
  if (!query.sortBy) {
    return undefined;
  }
  return { [query.sortBy]: query.sortOrder ?? 'desc' };
}

// ---------------------------------------------------------------------------
// Paginated response helpers
// ---------------------------------------------------------------------------

/**
 * Create a PaginatedResponse from a data array and total count.
 *
 * @param data     - The current page's data items.
 * @param total    - Total number of items across all pages.
 * @param query    - The pagination query used to fetch the data.
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  query: PaginationQuery,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / query.pageSize) || 1;

  return {
    data,
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages,
  };
}

/**
 * Create an empty PaginatedResponse.
 */
export function emptyPaginatedResponse<T>(
  query?: Partial<PaginationQuery>,
): PaginatedResponse<T> {
  const resolved = createPaginationQuery(query);

  return {
    data: [],
    total: 0,
    page: resolved.page,
    pageSize: resolved.pageSize,
    totalPages: 0,
  };
}

// ---------------------------------------------------------------------------
// Page metadata helpers
// ---------------------------------------------------------------------------

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
}

/**
 * Extract rich page metadata from a PaginatedResponse.
 */
export function getPageMeta<T>(response: PaginatedResponse<T>): PageMeta {
  return {
    page: response.page,
    pageSize: response.pageSize,
    total: response.total,
    totalPages: response.totalPages,
    hasNextPage: response.page < response.totalPages,
    hasPreviousPage: response.page > 1,
    isFirstPage: response.page === 1,
    isLastPage: response.page >= response.totalPages,
  };
}

/**
 * Get the page numbers to display in a pagination UI component.
 * Produces a window of pages around the current page with ellipsis indicators.
 *
 * @param currentPage  - The current page number.
 * @param totalPages   - Total number of pages.
 * @param windowSize   - Number of pages to show on each side of current (default: 2).
 * @returns An array of page numbers and `null` values representing ellipses.
 *
 * @example
 * getPageWindow(5, 20)
 * // [1, null, 3, 4, 5, 6, 7, null, 20]
 */
export function getPageWindow(
  currentPage: number,
  totalPages: number,
  windowSize = 2,
): (number | null)[] {
  if (totalPages <= 1) {
    return [1];
  }

  const pages: (number | null)[] = [];

  const windowStart = Math.max(2, currentPage - windowSize);
  const windowEnd = Math.min(totalPages - 1, currentPage + windowSize);

  // Always include the first page
  pages.push(1);

  // Ellipsis before window
  if (windowStart > 2) {
    pages.push(null);
  }

  // Window pages
  for (let i = windowStart; i <= windowEnd; i++) {
    pages.push(i);
  }

  // Ellipsis after window
  if (windowEnd < totalPages - 1) {
    pages.push(null);
  }

  // Always include the last page (if more than 1 page)
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

// ---------------------------------------------------------------------------
// In-memory pagination (for client-side use)
// ---------------------------------------------------------------------------

/**
 * Paginate an in-memory array using a PaginationQuery.
 * Supports optional sorting by a single field.
 *
 * @param items - The full array of items.
 * @param query - Pagination query.
 * @param sortFn - Optional custom sort comparator. If not provided and
 *                 query.sortBy is set, a basic string/number comparison is used.
 */
export function paginateArray<T>(
  items: T[],
  query: Partial<PaginationQuery>,
  sortFn?: (a: T, b: T) => number,
): PaginatedResponse<T> {
  const resolved = createPaginationQuery(query);
  let sorted = [...items];

  if (sortFn) {
    sorted.sort(sortFn);
  } else if (resolved.sortBy) {
    const key = resolved.sortBy as keyof T;
    const direction = resolved.sortOrder === 'asc' ? 1 : -1;
    sorted.sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal === bVal) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      return (aVal < bVal ? -1 : 1) * direction;
    });
  }

  const offset = getOffset(resolved);
  const paged = sorted.slice(offset, offset + resolved.pageSize);

  return createPaginatedResponse(paged, items.length, resolved);
}
