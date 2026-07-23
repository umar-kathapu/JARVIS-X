import { z } from 'zod';

export const CreateTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long').max(100),
  description: z.string().min(5, 'Description must be at least 5 characters long'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  assignedAgent: z.string().min(1, 'Assigned agent is required'),
});

export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
  resultPayload: z.record(z.unknown()).optional(),
  errorMessage: z.string().optional(),
});
