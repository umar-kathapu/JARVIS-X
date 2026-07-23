import { IAction, ActionDefinition, ActionResult } from '../../types/action.types.js';

export class NotificationAction implements IAction {
  readonly definition: ActionDefinition = {
    id: 'desktop_notification',
    name: 'Desktop Notification',
    description: 'Displays a system tray or popup notification',
    category: 'Desktop',
    parametersSchema: {
      title: { type: 'string', required: true },
      message: { type: 'string', required: true },
    },
  };

  async execute(params: Record<string, unknown>): Promise<ActionResult> {
    const startTime = Date.now();
    const title = String(params.title || 'JARVIS-X Notification');
    const message = String(params.message || '');

    return {
      success: true,
      data: { title, message, dispatchedAt: new Date().toISOString() },
      executionTimeMs: Date.now() - startTime,
    };
  }
}
