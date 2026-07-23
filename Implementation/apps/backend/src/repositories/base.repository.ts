import { buildPagination, formatPaginatedResult, PaginatedResult } from '../database/query-utils.js';

export abstract class BaseRepository<T> {
  protected abstract modelName: string;

  protected getPagination(page?: number, limit?: number) {
    return buildPagination({ page, limit });
  }

  protected formatResult(data: T[], totalCount: number, page: number, limit: number): PaginatedResult<T> {
    return formatPaginatedResult(data, totalCount, page, limit);
  }
}
