import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import * as argon2 from 'argon2';

import { UserRepository } from './user.repository';
import { User } from './user.entity';

describe('UserRepository', () => {
  let module: TestingModule;
  let userRepository: UserRepository;
  let manager: EntityManager;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          entities: [User],
        }),
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
    const inputs = { username: 'a-user', password: 'secret' };

    const entity = await userRepository.create({ ...inputs });
    expect(entity).toBeInstanceOf(User);

    const check = await manager.findOneBy<User>(User, { id: entity.id });
    expect(check.username).toBe(inputs.username);
    expect(check.password).toBeTruthy();
    expect(check.password).not.toBe(inputs.password);
    expect(check.lastLoginAt).toBeInstanceOf(Date);
  });

  it('should fail create user with existing username', async () => {
    const inputs = { username: 'a-user', password: 'secret' };
    await userRepository.create(inputs);
    await expect(() => userRepository.create(inputs)).rejects.toThrow();
  });

  it('should update user with hashed password', async () => {
    const inputs = { username: 'a-user', password: 'secret' };
    const entity = await userRepository.create({ ...inputs });

    const newPassword = 'new-secret';
    await userRepository.update(entity.id, { password: newPassword });

    const check = await manager.findOneBy<User>(User, { id: entity.id });
    expect(check.password).toBeTruthy();
    expect(check.password).not.toBe(inputs.password);
    expect(check.password).not.toBe(newPassword);
  });

  it('should login user with valid credentials', async () => {
    const inputs = { username: 'a-user', password: 'secret' };
    const entity = await userRepository.create({ ...inputs });

    const authed = await userRepository.verify(
      inputs.username,
      inputs.password,
    );
    expect(authed).toBeInstanceOf(User);
    expect((authed as User).id).toBe(entity.id);
    expect((authed as User).username).toBe(inputs.username);
    expect((authed as User).lastLoginAt.valueOf()).toBeGreaterThan(
      entity.lastLoginAt.valueOf(),
    );
  });

  it('should rehash password on user login', async () => {
    const inputs = { username: 'a-user', password: 'secret' };
    const oldHashedPassword = await argon2.hash(inputs.password, {
      version: 0x1,
    });
    await userRepository.repository.insert({
      username: inputs.username,
      password: oldHashedPassword,
      lastLoginAt: new Date(),
    });

    const authed = await userRepository.verify(
      inputs.username,
      inputs.password,
    );
    expect(authed).toBeInstanceOf(User);
    expect((authed as User).username).toBe(inputs.username);
    expect((authed as User).password).not.toBe(oldHashedPassword);
  });

  it('should not login user with invalid credentials', async () => {
    const inputs = { username: 'a-user', password: 'secret' };
    await userRepository.create({ ...inputs });

    const authed1 = await userRepository.verify(inputs.username, 'incorrect');
    expect(authed1).toBe(false);

    const authed2 = await userRepository.verify('incorrect', inputs.password);
    expect(authed2).toBe(false);

    const authed3 = await userRepository.verify('incorrect', 'incorrect');
    expect(authed3).toBe(false);
  });
});
