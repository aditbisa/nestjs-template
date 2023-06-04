import { Test } from '@nestjs/testing';
import { In } from 'typeorm';

import { UserRepository } from '@models/user';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  const userRepositoryMock = {
    findPaginated: jest.fn(),
  };

  beforeEach(async () => {
    userRepositoryMock.findPaginated.mockClear();

    const module = await Test.createTestingModule({
      providers: [
        { provide: UserRepository, useValue: userRepositoryMock },
        UsersService,
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should query paginated users for sys-admin', async () => {
    userRepositoryMock.findPaginated.mockResolvedValue('users');
    const param = { page: 1, countPerPage: 2 };
    const result = await service.list('sys-admin', param);
    expect(result).toBe('users');
    expect(userRepositoryMock.findPaginated).toHaveBeenCalledWith(param, {
      role: In(['sys-admin', 'admin', 'courier', 'helper']),
    });
  });

  it('should query paginated users for admin', async () => {
    userRepositoryMock.findPaginated.mockResolvedValue('users');
    const param = { page: 1, countPerPage: 2 };
    const result = await service.list('admin', param);
    expect(result).toBe('users');
    expect(userRepositoryMock.findPaginated).toHaveBeenCalledWith(param, {
      role: In(['courier', 'helper']),
    });
  });
});
