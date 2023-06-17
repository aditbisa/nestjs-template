import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { In } from 'typeorm';

import { User, UserRepository } from '@models/user';
import { UsersService } from './users.service';

const adminUserMock = {
  id: null,
  username: 'admin',
  password: 'admin',
  role: 'admin',
} as User;
const courierUserMock = {
  id: null,
  username: 'courier',
  password: 'courier',
  role: 'courier',
} as User;

describe('UsersService', () => {
  let service: UsersService;

  const userRepositoryMock = {
    findPaginated: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    userRepositoryMock.findPaginated.mockClear();
    userRepositoryMock.findOne.mockClear();
    userRepositoryMock.create.mockClear();

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

  it('should return user', async () => {
    userRepositoryMock.findOne.mockResolvedValue(courierUserMock);
    const user = await service.findOne('admin', 1);
    expect(user).toEqual(courierUserMock);
    expect(userRepositoryMock.findOne).toHaveBeenCalledWith(1);
  });

  it('should create a new user', async () => {
    userRepositoryMock.create.mockResolvedValue(courierUserMock);
    const inputs = {
      username: courierUserMock.username,
      password: courierUserMock.password,
      role: courierUserMock.role,
    };
    const user = await service.create('admin', inputs);
    expect(user).toEqual(courierUserMock);
    expect(userRepositoryMock.create).toHaveBeenCalledWith(inputs);
  });

  it('should throw unauthorized on low role', async () => {
    userRepositoryMock.findOne.mockResolvedValue(adminUserMock);
    expect(() => service.findOne('admin', 1)).rejects.toThrowError(
      UnauthorizedException,
    );
    expect(() => service.create('admin', adminUserMock)).rejects.toThrowError(
      UnauthorizedException,
    );
  });
});
