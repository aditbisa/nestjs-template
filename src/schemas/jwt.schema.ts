import { UserRole } from './user.schema';

export const JWT_TOKEN_TYPE = 'Bearer';

export const JWT_PAYLOAD_REQUEST_KEY = 'token-payload';

export interface JwtToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface JwtCustomPayload {
  sub: number; // userId
  username: string;
  role: UserRole;
}

export interface JwtParsedPayload {
  userId: number;
  username: string;
  role: UserRole;
}
