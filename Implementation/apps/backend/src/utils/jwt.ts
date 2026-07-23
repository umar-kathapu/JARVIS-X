export interface TokenUserPayload {
  id: string;
  email: string;
  role: string;
}

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}
