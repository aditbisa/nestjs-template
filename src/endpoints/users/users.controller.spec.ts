import { Test, TestingModule } from '@nestjs/testing';

import { JwtParsedPayload } from '@schemas';
import { User } from '@models/user';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const usersServiceMock = {
    list: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    usersServiceMock.list.mockClear();
    usersServiceMock.create.mockClear();
    usersServiceMock.findOne.mockClear();

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
    expect(usersServiceMock.list).toHaveBeenCalledWith(
      tokenPayload.role,
      query,
    );
  });

  it('should create user', async () => {
    usersServiceMock.create.mockResolvedValue('user');
    const payload = {
      username: 'username',
      password: 'password',
      role: 'courier',
    } as User;
    const tokenPayload = { role: 'admin' } as JwtParsedPayload;
    const result = await controller.create(payload, tokenPayload);
    expect(result).toBe('user');
    expect(usersServiceMock.create).toHaveBeenCalledWith(
      tokenPayload.role,
      payload,
    );
  });

  it('should view user profile', async () => {
    usersServiceMock.findOne.mockResolvedValue('user');
    const paramUserId = 1;
    const tokenPayload = { role: 'admin' } as JwtParsedPayload;
    const result = await controller.view(paramUserId, tokenPayload);
    expect(result).toBe('user');
    expect(usersServiceMock.findOne).toHaveBeenCalledWith(
      tokenPayload.role,
      paramUserId,
    );
  });
});
