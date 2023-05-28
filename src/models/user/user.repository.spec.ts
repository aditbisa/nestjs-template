import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import * as argon2 from 'argon2';

import { AppConfigModule } from '@configs/app';
import { UserRepository } from './user.repository';
import { User } from './user.entity';

const userMock = {
  username: 'username',
  password: 'password',
  role: 'courier',
} as User;

describe('UserRepository', () => {
  let module: TestingModule;
  let userRepository: UserRepository;
  let manager: EntityManager;

  beforeAll(async () => {
    process.env.APP_SALT = '12345678';

    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          entities: [User],
        }),
        AppConfigModule,
      ],
      providers: [UserRepository],
    }).compile();

    manager = module.get<EntityManager>(EntityManager);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(async () => {
    await userRepository.repository.clear();
  });

  it('should create new user with hashed password', async () => {
    const entity = await userRepository.create({ ...userMock });
    expect(entity).toBeInstanceOf(User);

    const check = await manager.findOneBy<User>(User, { id: entity.id });
    expect(check.username).toBe(userMock.username);
    expect(check.password).toBeTruthy();
    expect(check.password).not.toBe(userMock.password);
    expect(check.lastLoginAt).toBeInstanceOf(Date);
  });

  it('should fail create user with existing username', async () => {
    await userRepository.create({ ...userMock });
    await expect(() => userRepository.create(userMock)).rejects.toThrow();
  });

  it('should update user with hashed password', async () => {
    const entity = await userRepository.create({ ...userMock });

    const newPassword = 'new-secret';
    await userRepository.update(entity.id, { password: newPassword });

    const check = await manager.findOneBy<User>(User, { id: entity.id });
    expect(check.password).toBeTruthy();
    expect(check.password).not.toBe(userMock.password);
    expect(check.password).not.toBe(newPassword);
  });

  it('should login user with valid credentials', async () => {
    const entity = await userRepository.create({ ...userMock });

    const authed = await userRepository.verify(
      userMock.username,
      userMock.password,
    );
    expect(authed).toBeInstanceOf(User);
    expect((authed as User).id).toBe(entity.id);
    expect((authed as User).username).toBe(userMock.username);
    expect((authed as User).lastLoginAt.valueOf()).toBeGreaterThan(
      entity.lastLoginAt.valueOf(),
    );
  });

  it('should rehash password on user login', async () => {
    const oldHashedPassword = await argon2.hash(userMock.password, {
      version: 0x1,
    });
    await userRepository.repository.insert({
      ...userMock,
      password: oldHashedPassword,
      lastLoginAt: new Date(),
    });

    const authed = await userRepository.verify(
      userMock.username,
      userMock.password,
    );
    expect(authed).toBeInstanceOf(User);
    expect((authed as User).username).toBe(userMock.username);
    expect((authed as User).password).not.toBe(oldHashedPassword);
  });

  it('should not login user with invalid credentials', async () => {
    await userRepository.create({ ...userMock });

    const authed1 = await userRepository.verify(userMock.username, 'incorrect');
    expect(authed1).toBe(false);

    const authed2 = await userRepository.verify('incorrect', userMock.password);
    expect(authed2).toBe(false);

    const authed3 = await userRepository.verify('incorrect', 'incorrect');
    expect(authed3).toBe(false);
  });
});
