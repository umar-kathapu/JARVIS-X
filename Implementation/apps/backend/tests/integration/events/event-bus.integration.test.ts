import { describe, it, expect, vi } from 'vitest';
import { EventBus, SystemEventPayload } from '../../../src/plugins/events/event-bus.js';

describe('Event Bus Subsystem Integration Tests', () => {
  it('1. Should publish and deliver events to subscribed handlers with payload metadata', () => {
    const bus = new EventBus();
    const mockHandler = vi.fn();

    const unsubscribe = bus.subscribe<string>('AI_RESPONSE', mockHandler);

    bus.publish('AI_RESPONSE', 'ai-engine', 'Analysis completed successfully');

    expect(mockHandler).toHaveBeenCalledTimes(1);
    const payload: SystemEventPayload<string> = mockHandler.mock.calls[0]![0];
    expect(payload.type).toBe('AI_RESPONSE');
    expect(payload.source).toBe('ai-engine');
    expect(payload.data).toBe('Analysis completed successfully');
    expect(payload.timestamp).toBeDefined();

    unsubscribe();
  });

  it('2. Should support multiple subscribers for the same event type', () => {
    const bus = new EventBus();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    const unsub1 = bus.subscribe('AUTOMATION_COMPLETED', handler1);
    const unsub2 = bus.subscribe('AUTOMATION_COMPLETED', handler2);

    bus.publish('AUTOMATION_COMPLETED', 'automation-engine', { workflowId: 'wf_123' });

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);

    unsub1();
    unsub2();
  });

  it('3. Should clean up listeners on unsubscribe function execution', () => {
    const bus = new EventBus();
    const handler = vi.fn();

    const unsubscribe = bus.subscribe('PLUGIN_INSTALLED', handler);
    bus.publish('PLUGIN_INSTALLED', 'plugin-engine', { pluginId: 'p1' });
    expect(handler).toHaveBeenCalledTimes(1);

    unsubscribe();
    bus.publish('PLUGIN_INSTALLED', 'plugin-engine', { pluginId: 'p2' });
    expect(handler).toHaveBeenCalledTimes(1); // Should not increase
  });

  it('4. Should deliver all published events to wildcard "*" subscribers', () => {
    const bus = new EventBus();
    const wildcardHandler = vi.fn();

    const unsubscribe = bus.subscribe('*', wildcardHandler);

    bus.publish('MEMORY_STORED', 'memory-engine', { id: 'm1' });
    bus.publish('APP_STARTED', 'server', { status: 'ok' });

    expect(wildcardHandler).toHaveBeenCalledTimes(2);

    unsubscribe();
  });

  it('5. Should handle errors in subscriber handlers gracefully', () => {
    const bus = new EventBus();
    const faultyHandler = vi.fn(() => {
      throw new Error('Subscriber internal failure');
    });

    bus.subscribe('APP_SHUTDOWN', faultyHandler);

    expect(() => {
      bus.publish('APP_SHUTDOWN', 'server', { code: 0 });
    }).toThrow('Subscriber internal failure');

    expect(faultyHandler).toHaveBeenCalledTimes(1);
  });
});
