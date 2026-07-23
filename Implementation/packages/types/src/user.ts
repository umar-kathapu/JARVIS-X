export type UserRole = 'ADMIN' | 'OPERATOR' | 'SYSTEM' | 'GUEST';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  notificationsEnabled: boolean;
  aiAutoSuggest: boolean;
  defaultModel: string;
}
