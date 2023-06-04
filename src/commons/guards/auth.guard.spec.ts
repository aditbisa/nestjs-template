import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
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
    role: 'courier',
  };
  const requestMock = {
    headers: {
      authorization: '',
    },
  };
  const reflectorMock = {
    getAllAndOverride: jest.fn(),
  };
  const createContextForToken = (token: string) => {
    requestMock.headers.authorization = `Bearer ${token}`;
    return {
      switchToHttp: () => ({
        getRequest: () => requestMock,
      }),
      getHandler: () => null,
      getClass: () => null,
    } as ExecutionContext;
  };

  beforeEach(async () => {
    delete requestMock[JWT_PAYLOAD_REQUEST_KEY];
    reflectorMock.getAllAndOverride.mockReset();

    const module = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: jwtConfigMock.secret,
          signOptions: { expiresIn: jwtConfigMock.expiresIn },
        }),
      ],
      providers: [AuthGuard, { provide: Reflector, useValue: reflectorMock }],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should return true on valid token', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(false);
    const token = await jwtService.signAsync(payloadMock);
    const context = createContextForToken(token);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);

    const tokenPayload = requestMock[JWT_PAYLOAD_REQUEST_KEY];
    expect(tokenPayload['sub']).toEqual(payloadMock.sub);
    expect(tokenPayload['username']).toEqual(payloadMock.username);
  });

  it('should return false on invalid token', async () => {
    // invalid jwt secret, generated from https://jwt.io/
    const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsIm5hbWUiOiJhLXVzZXIiLCJpYXQiOjE1MTYyMzkwMjJ9.tYZJ0OYR5HPX_brW6SdZxV9-y2eFoKZg_C9xZXQ0W7g`;
    const context = createContextForToken(token);

    expect(() => guard.canActivate(context)).rejects.toThrowError(
      UnauthorizedException,
    );
    expect(requestMock[JWT_PAYLOAD_REQUEST_KEY]).toBeFalsy();
  });

  it('should return true on public endpoint', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(true);
    const context = createContextForToken('');
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should return true on valid role', async () => {
    reflectorMock.getAllAndOverride
      .mockReturnValueOnce(false)
      .mockReturnValueOnce([payloadMock.role]);
    const token = await jwtService.signAsync(payloadMock);
    const context = createContextForToken(token);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should return false on invalid role', async () => {
    reflectorMock.getAllAndOverride
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(['no']);
    const token = await jwtService.signAsync(payloadMock);
    const context = createContextForToken(token);

    const result = await guard.canActivate(context);
    expect(result).toBe(false);
  });
});
