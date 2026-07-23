import { Router, Request, Response } from 'express';
import { prisma } from '../db/client.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req: Request, res: Response) => {
  let dbConnected = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
  } catch {
    dbConnected = false;
  }

  res.json({
    status: dbConnected ? 'healthy' : 'degraded',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      database: dbConnected,
      aiEngine: true,
    },
  });
});
