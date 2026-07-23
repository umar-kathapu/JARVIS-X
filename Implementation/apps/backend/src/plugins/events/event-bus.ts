import { EventEmitter } from 'events';
import { logger } from '../../utils/logger.js';

export type SystemEventType =
  | 'APP_STARTED'
  | 'APP_SHUTDOWN'
  | 'AI_RESPONSE'
  | 'CONVERSATION_CREATED'
  | 'MEMORY_STORED'
  | 'PLUGIN_INSTALLED'
  | 'PLUGIN_REMOVED'
  | 'AUTOMATION_COMPLETED'
  | string;

export interface SystemEventPayload<T = unknown> {
  type: SystemEventType;
  source: string;
  data: T;
  timestamp: string;
}

export class EventBus {
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(100);
  }

  publish<T>(type: SystemEventType, source: string, data: T): void {
    const payload: SystemEventPayload<T> = {
      type,
      source,
      data,
      timestamp: new Date().toISOString(),
    };
    logger.debug(`[EventBus] Published '${type}' from '${source}'`);
    this.emitter.emit(type, payload);
    this.emitter.emit('*', payload);
  }

  subscribe<T>(type: SystemEventType, handler: (payload: SystemEventPayload<T>) => void): () => void {
    const listener = (payload: SystemEventPayload<T>) => handler(payload);
    this.emitter.on(type, listener);
    return () => this.emitter.off(type, listener);
  }
}

export const eventBus = new EventBus();
