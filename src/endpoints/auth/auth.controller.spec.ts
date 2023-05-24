import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock = {
    signIn: jest.fn(),
  };

  beforeEach(async () => {
    authServiceMock.signIn.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: AuthService, useValue: authServiceMock }],
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should sign in user', async () => {
    authServiceMock.signIn.mockResolvedValue('authed');
    const payload = {
      username: 'a-user',
      password: 'secret',
    };

    const token = await controller.signIn(payload);
    expect(token).toBe('authed');
  });
});
