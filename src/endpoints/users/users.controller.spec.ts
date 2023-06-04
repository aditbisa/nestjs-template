import { Test, TestingModule } from '@nestjs/testing';

import { JwtParsedPayload } from '@schemas';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const usersServiceMock = {
    list: jest.fn(),
  };

  beforeEach(async () => {
    usersServiceMock.list.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: UsersService, useValue: usersServiceMock }],
      controllers: [UsersController],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list user', async () => {
    usersServiceMock.list.mockResolvedValue('users');
    const query = { page: 1, countPerPage: 2 };
    const tokenPayload = { role: 'admin' } as JwtParsedPayload;
    const result = await controller.list(query, tokenPayload);
    expect(result).toBe('users');
  });
});
