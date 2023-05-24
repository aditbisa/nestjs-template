import { Test } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';

import { AuthGuard } from './auth.guard';
import { JWT_PAYLOAD_REQUEST_KEY } from '@schemas';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;

  const jwtConfigMock = {
    secret: 'secret',
    expiresIn: 3600,
  };
  const payloadMock = {
    sub: 1,
    username: 'a-user',
  };
  const requestMock = {
    headers: {
      authorization: '',
    },
  };
  const createContextForToken = (token: string) => {
    requestMock.headers.authorization = `Bearer ${token}`;
    return {
      switchToHttp: () => ({
        getRequest: () => requestMock,
      }),
    } as ExecutionContext;
  };

  beforeEach(async () => {
    delete requestMock[JWT_PAYLOAD_REQUEST_KEY];

    const module = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: jwtConfigMock.secret,
          signOptions: { expiresIn: jwtConfigMock.expiresIn },
        }),
      ],
      providers: [AuthGuard],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should return true on valid token', async () => {
    const token = await jwtService.signAsync(payloadMock);
    const context = createContextForToken(token);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);

    const tokenPayload = requestMock[JWT_PAYLOAD_REQUEST_KEY];
    expect(tokenPayload['sub']).toEqual(payloadMock.sub);
    expect(tokenPayload['username']).toEqual(payloadMock.username);
  });

  it('should return true on invalid token', async () => {
    // invalid jwt secret, generated from https://jwt.io/
    const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsIm5hbWUiOiJhLXVzZXIiLCJpYXQiOjE1MTYyMzkwMjJ9.tYZJ0OYR5HPX_brW6SdZxV9-y2eFoKZg_C9xZXQ0W7g`;
    const context = createContextForToken(token);

    expect(() => guard.canActivate(context)).rejects.toThrowError(
      UnauthorizedException,
    );
    expect(requestMock[JWT_PAYLOAD_REQUEST_KEY]).toBeFalsy();
  });
});
