import { z } from 'zod';

export const UuidParamSchema = z.object({
  id: z.string().uuid('Invalid UUID parameter'),
});

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
