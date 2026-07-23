import { UserProfileMemory, UserPreference, UserGoal } from '../types/profile.types.js';

export class UserProfileService {
  private profiles: Map<string, UserProfileMemory> = new Map();

  async getUserProfile(userId: string): Promise<UserProfileMemory> {
    let profile = this.profiles.get(userId);
    if (!profile) {
      profile = {
        userId,
        name: 'JARVIS-X Operator',
        email: 'operator@jarvis-x.ai',
        preferences: [
          { key: 'theme', value: 'dark', category: 'ui' },
          { key: 'defaultModel', value: 'gpt-4o', category: 'ai' },
        ],
        activeGoals: [
          { id: 'goal_1', description: 'Initialize Production Monorepo', status: 'ACHIEVED' },
        ],
        frequentlyUsedCommands: ['pnpm dev', 'docker compose up'],
        lastInteractionAt: new Date().toISOString(),
      };
      this.profiles.set(userId, profile);
    }
    return profile;
  }

  async updatePreference(userId: string, key: string, value: unknown, category: 'ui' | 'ai' | 'notification' | 'system' = 'ui'): Promise<void> {
    const profile = await this.getUserProfile(userId);
    const existing = profile.preferences.find((p) => p.key === key);
    if (existing) {
      existing.value = value;
    } else {
      profile.preferences.push({ key, value, category });
    }
    profile.lastInteractionAt = new Date().toISOString();
  }

  async addGoal(userId: string, description: string): Promise<UserGoal> {
    const profile = await this.getUserProfile(userId);
    const goal: UserGoal = {
      id: `goal_${Date.now()}`,
      description,
      status: 'ACTIVE',
    };
    profile.activeGoals.push(goal);
    return goal;
  }
}

export const userProfileService = new UserProfileService();
