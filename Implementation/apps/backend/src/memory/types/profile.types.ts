export interface UserPreference {
  key: string;
  value: unknown;
  category: 'ui' | 'ai' | 'notification' | 'system';
}

export interface UserGoal {
  id: string;
  description: string;
  targetDate?: string;
  status: 'ACTIVE' | 'ACHIEVED' | 'PAUSED';
}

export interface UserProfileMemory {
  userId: string;
  name: string;
  email: string;
  preferences: UserPreference[];
  activeGoals: UserGoal[];
  frequentlyUsedCommands: string[];
  lastInteractionAt: string;
}
