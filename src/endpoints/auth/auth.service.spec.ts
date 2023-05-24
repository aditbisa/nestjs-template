import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { TOKEN_TYPE } from '@schemas';
import { JwtConfigService } from '@configs/jwt';
import { User, UserRepository } from '@models/user';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const jwtConfigMock = {
    secret: 'secret',
    expiresIn: 3600,
  };
  const userMock = {
    id: 1,
    username: 'a-user',
  } as User;
  const userRepositoryMock = {
    verify: jest.fn(),
  };

  beforeEach(async () => {
    userRepositoryMock.verify.mockClear();

    const module = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: jwtConfigMock.secret,
          signOptions: { expiresIn: jwtConfigMock.expiresIn },
        }),
      ],
      providers: [
        { provide: JwtConfigService, useValue: jwtConfigMock },
        { provide: UserRepository, useValue: userRepositoryMock },
        AuthService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should return jwt token on valid credentials', async () => {
    userRepositoryMock.verify.mockResolvedValue(userMock);
    const username = userMock.username;
    const password = 'secret';

    const result = await service.signIn(username, password);
    expect(result).toBeTruthy();
    expect(result.access_token).toBeTruthy();
    expect(result.expires_in).toBe(jwtConfigMock.expiresIn);
    expect(result.token_type).toBe(TOKEN_TYPE);
  });

  it('should throw unauthorized on invalid credentials', async () => {
    userRepositoryMock.verify.mockResolvedValue(false);
    const username = userMock.username;
    const password = 'secret';

    expect(() => service.signIn(username, password)).rejects.toThrowError(
      UnauthorizedException,
    );
  });
});
