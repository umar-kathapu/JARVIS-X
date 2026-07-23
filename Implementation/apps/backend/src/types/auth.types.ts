export type Role = 'ADMIN' | 'OPERATOR' | 'SYSTEM' | 'GUEST';

export interface UserAuthContext {
  id: string;
  email: string;
  role: Role;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResult {
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
  };
  tokens: AuthTokens;
}
