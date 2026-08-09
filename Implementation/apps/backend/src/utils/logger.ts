import { pino } from 'pino';
import { env } from '../config/env.js';

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["set-cookie"]',
      '*.password',
      '*.token',
      '*.refreshToken',
      '*.jwtSecret',
      '*.jwtRefreshSecret',
      '*.apiKey',
      '*.api_key',
      '*.secret',
      '*.authorization',
      '*.databaseUrl',
      '*.database_url',
      'password',
      'token',
      'refreshToken',
      'apiKey',
      'secret',
      'cookie',
    ],
    censor: '[REDACTED_SENSITIVE_DATA]',
  },
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  base: {
    env: env.NODE_ENV,
    service: 'jarvis-x-backend',
  },
});
