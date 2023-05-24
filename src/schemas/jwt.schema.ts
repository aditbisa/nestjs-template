export const JWT_TOKEN_TYPE = 'Bearer';

export const JWT_PAYLOAD_REQUEST_KEY = 'token-payload';

export interface JwtToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface JwtParsedPayload {
  userId: number;
  username: string;
}
