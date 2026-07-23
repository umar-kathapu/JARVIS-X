import { TriggerDefinition } from '../types/trigger.types.js';
import { eventBus } from '../../plugins/events/event-bus.js';

export class TriggerRegistry {
  private triggers: Map<string, TriggerDefinition> = new Map();

  registerTrigger(trigger: TriggerDefinition): void {
    this.triggers.set(trigger.id, trigger);
    if (trigger.type === 'PLUGIN_EVENT' || trigger.type === 'AI_RESPONSE') {
      eventBus.subscribe(trigger.type, (payload) => {
        console.log(`[TriggerRegistry] Trigger '${trigger.id}' fired by event '${payload.type}'`);
      });
    }
  }

  getTrigger(id: string): TriggerDefinition | undefined {
    return this.triggers.get(id);
  }
}

export const triggerRegistry = new TriggerRegistry();
