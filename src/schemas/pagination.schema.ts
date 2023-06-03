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
