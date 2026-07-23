import { Router, Request, Response } from 'express';
import { UserRegistrationSchema, HTTP_STATUS } from '@jarvis-x/shared';
import { prisma } from '../db/client.js';

export const usersRouter = Router();

usersRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    res.json({ success: true, data: users, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: { code: 'USER_FETCH_FAILED', details: String(error) },
      timestamp: new Date().toISOString(),
    });
  }
});

usersRouter.post('/', async (req: Request, res: Response) => {
  try {
    const validated = UserRegistrationSchema.parse(req.body);
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        name: validated.name,
        role: validated.role,
      },
    });
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: user,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: 'USER_CREATION_FAILED', details: error },
      timestamp: new Date().toISOString(),
    });
  }
});
