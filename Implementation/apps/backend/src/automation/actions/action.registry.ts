import { IAction, ActionDefinition } from '../types/action.types.js';

export class ActionRegistry {
  private actions: Map<string, IAction> = new Map();

  registerAction(action: IAction): void {
    this.actions.set(action.definition.id, action);
  }

  getAction(id: string): IAction | undefined {
    return this.actions.get(id);
  }

  getAllDefinitions(): ActionDefinition[] {
    return Array.from(this.actions.values()).map((a) => a.definition);
  }
}

export const actionRegistry = new ActionRegistry();
