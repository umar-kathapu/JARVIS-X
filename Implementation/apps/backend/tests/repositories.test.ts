import { describe, it, expect } from 'vitest';
import { buildPagination, formatPaginatedResult } from '../src/database/query-utils.js';

describe('Database Query Utilities & Pagination', () => {
  it('buildPagination should enforce page >= 1 and default limit of 20', () => {
    const p1 = buildPagination({});
    expect(p1.page).toBe(1);
    expect(p1.limit).toBe(20);
    expect(p1.skip).toBe(0);

    const p2 = buildPagination({ page: 3, limit: 10 });
    expect(p2.page).toBe(3);
    expect(p2.limit).toBe(10);
    expect(p2.skip).toBe(20);
  });

  it('formatPaginatedResult should correctly calculate totalPages', () => {
    const items = ['a', 'b', 'c'];
    const result = formatPaginatedResult(items, 25, 1, 10);
    expect(result.data).toHaveLength(3);
    expect(result.pagination.totalCount).toBe(25);
    expect(result.pagination.totalPages).toBe(3);
  });
});
