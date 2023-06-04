import { ExecutionContext } from '@nestjs/common';

import { JWT_PAYLOAD_REQUEST_KEY } from '@schemas';
import { getJWTParsedPayloadFactory } from './jwt-parse-payload.decorator';

describe('getJWTParsedPayloadFactory', () => {
  it('should return parsed payload from user', () => {
    const contextMock = {
      switchToHttp: () => ({
        getRequest: () => ({
          [JWT_PAYLOAD_REQUEST_KEY]: {
            sub: 1,
            username: 'a-user',
            role: 'courier',
          },
        }),
      }),
    } as ExecutionContext;

    const result = getJWTParsedPayloadFactory({}, contextMock);
    expect(result).toEqual({
      userId: 1,
      username: 'a-user',
      role: 'courier',
    });
  });

  it('should return null on guest user', () => {
    const contextMock = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as ExecutionContext;

    const result = getJWTParsedPayloadFactory({}, contextMock);
    expect(result).toBe(null);
  });
});
