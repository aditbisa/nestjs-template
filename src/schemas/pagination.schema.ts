/**
 * Schema for paginated data collection.
 */
export interface PaginatedData<T> {
  data: T[];
  page: number;
  count: number;
  countPerPage: number;
  totalPage: number;
  totalCount: number;
}

/**
 * Paginated data request schema.
 */
export interface PaginatedParam {
  page: number;
  countPerPage: number;
}
