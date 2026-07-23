import { Router, Request, Response } from 'express';
import { CreateTaskSchema, HTTP_STATUS } from '@jarvis-x/shared';
import { prisma } from '../db/client.js';

export const tasksRouter = Router();

// GET all agent tasks
tasksRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const tasks = await prisma.agentTask.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: tasks, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: { code: 'TASK_FETCH_FAILED', details: String(error) },
      timestamp: new Date().toISOString(),
    });
  }
});

// POST create new agent task
tasksRouter.post('/', async (req: Request, res: Response) => {
  try {
    const validated = CreateTaskSchema.parse(req.body);
    const task = await prisma.agentTask.create({
      data: {
        title: validated.title,
        description: validated.description,
        priority: validated.priority,
        assignedAgent: validated.assignedAgent,
        status: 'PENDING',
      },
    });
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: task,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', details: error },
      timestamp: new Date().toISOString(),
    });
  }
});
