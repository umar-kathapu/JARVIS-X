import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// List of weak / default secrets prohibited in production environments
const INSECURE_DEFAULT_SECRETS = new Set([
  'jarvis_super_secret_jwt_key_enterprise_2026_x',
  'jarvis_super_secret_refresh_jwt_key_2026_x',
  'secret',
  'jwt_secret',
  'change_me',
  'password',
  '12345678',
]);

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.string().transform((val) => parseInt(val, 10)).default('4000'),
    HOST: z.string().default('0.0.0.0'),
    DATABASE_URL: z
      .string()
      .min(1, 'DATABASE_URL is required')
      .default('postgresql://jarvis_admin:jarvis_secure_pass_2026@localhost:5432/jarvis_x_db?schema=public'),
    REDIS_URL: z.string().default('redis://localhost:6379'),
    JWT_SECRET: z.string({
      required_error: 'JWT_SECRET is mandatory for authentication security.',
    }),
    JWT_REFRESH_SECRET: z.string({
      required_error: 'JWT_REFRESH_SECRET is mandatory for authentication security.',
    }),
    JWT_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
    CORS_ORIGIN: z.string().default('http://localhost:3000,http://localhost:5173'),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  })
  .superRefine((data, ctx) => {
    // 1. Minimum Secret Length Security Check (Must be >= 32 characters)
    if (data.JWT_SECRET.length < 32) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['JWT_SECRET'],
        message: `JWT_SECRET is too weak (${data.JWT_SECRET.length} chars). It must be at least 32 characters long for HMAC-SHA256 signature strength.`,
      });
    }

    if (data.JWT_REFRESH_SECRET.length < 32) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['JWT_REFRESH_SECRET'],
        message: `JWT_REFRESH_SECRET is too weak (${data.JWT_REFRESH_SECRET.length} chars). It must be at least 32 characters long for HMAC-SHA256 signature strength.`,
      });
    }

    // 2. Prohibit Known Insecure Default Secrets
    if (INSECURE_DEFAULT_SECRETS.has(data.JWT_SECRET)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['JWT_SECRET'],
        message: 'JWT_SECRET matches a known insecure default string. Provide a unique, strong secret.',
      });
    }

    if (INSECURE_DEFAULT_SECRETS.has(data.JWT_REFRESH_SECRET)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['JWT_REFRESH_SECRET'],
        message: 'JWT_REFRESH_SECRET matches a known insecure default string. Provide a unique, strong secret.',
      });
    }

    // 3. Enforce Strict Production Environment Safeguards
    if (data.NODE_ENV === 'production') {
      if (data.JWT_SECRET === data.JWT_REFRESH_SECRET) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['JWT_REFRESH_SECRET'],
          message: 'Production Security Violation: JWT_SECRET and JWT_REFRESH_SECRET must be distinct cryptographic keys.',
        });
      }
    }
  });

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('\n==========================================================');
    console.error('❌ CRITICAL SECURITY ERROR: ENVIRONMENT VALIDATION FAILED');
    console.error('==========================================================');
    const formattedErrors = result.error.format();
    Object.entries(formattedErrors).forEach(([key, value]) => {
      if (key !== '_errors' && (value as any)._errors?.length) {
        console.error(` 🚨 [${key}]: ${(value as any)._errors.join('; ')}`);
      }
    });
    console.error('==========================================================\n');
    throw new Error('Mandatory environment configuration failed startup validation.');
  }
  return result.data;
};

export const env = parseEnv();
