import { env } from './env.js';

export const appConfig = {
  name: 'JARVIS-X Enterprise Backend API',
  version: '1.0.1',
  apiVersion: 'v1',
  env: env.NODE_ENV,
  port: env.PORT,
  host: env.HOST,
  security: {
    jwtSecret: env.JWT_SECRET,
    jwtRefreshSecret: env.JWT_REFRESH_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN,
    jwtRefreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    bcryptSaltRounds: 10,
    rateLimitMax: 100,
    rateLimitWindowMs: 60 * 1000, // 1 minute
  },
  cors: {
    origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
    credentials: true,
  },
  redis: {
    url: env.REDIS_URL,
  },
  database: {
    url: env.DATABASE_URL,
  },
} as const;
