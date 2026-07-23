import { z } from 'zod';

export const UserSettingsSchema = z.object({
  theme: z.enum(['dark', 'light', 'system']),
  notificationsEnabled: z.boolean(),
  aiAutoSuggest: z.boolean(),
  defaultModel: z.string(),
});

export const UserRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  role: z.enum(['ADMIN', 'OPERATOR', 'SYSTEM', 'GUEST']).default('OPERATOR'),
});
