import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { JWT_PAYLOAD_REQUEST_KEY, JwtParsedPayload } from '@schemas';

export function getJWTParsedPayloadFactory(
  data: any,
  ctx: ExecutionContext,
): JwtParsedPayload | null {
  /**
   * Defines a factory that returns the parsed custom claims of the JWT token.
   * To be used with createParamDecorator.
   *
   * The payload itself has been injected into request by AuthGuard.
   * Hence this should be used along side with AuthGuard.
   *
   * @param data - Unused data parameter needed by the decorator.
   * @param ctx - The execution context.
   * @returns - The parsed custom claims of the JWT token or null.
   */
  const request = ctx.switchToHttp().getRequest();
  const payload = request[JWT_PAYLOAD_REQUEST_KEY];
  if (!payload) {
    return null;
  }

  return {
    userId: payload['sub'],
    username: payload['username'],
    role: payload['role'],
  };
}

export const JwtParsePayload = createParamDecorator(getJWTParsedPayloadFactory);
