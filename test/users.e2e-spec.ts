import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import { AppModule } from '@src/app.module';
import { User, UserRepositoryModule, UserRepository } from '@models/user';
import { AuthModule, AuthService } from '@endpoints/auth';

const sysAdminUserMock = {
  id: 1,
  username: 'sys-admin',
  password: 'sys-admin',
  role: 'sys-admin',
} as User;
const adminUserMock = {
  id: 2,
  username: 'admin',
  password: 'admin',
  role: 'admin',
} as User;
const courierUserMock = {
  id: 3,
  username: 'courier',
  password: 'courier',
  role: 'courier',
} as User;

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;

  const getAuthHeader = async (user: User): Promise<[string, string]> => {
    const jwt = await authService['getJwtToken'](user);
    return ['Authorization', `Bearer ${jwt.access_token}`];
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule, UserRepositoryModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();

    const userRepo = moduleFixture.get(UserRepository);
    for (const userMock of [sysAdminUserMock, adminUserMock, courierUserMock]) {
      await userRepo.update(userMock.id, { password: userMock.username });
    }
    authService = moduleFixture.get(AuthService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/users (GET)', async () => {
    const auths = await getAuthHeader(sysAdminUserMock);
    const res: request.Response = await request(app.getHttpServer())
      .get('/users')
      .set(...auths)
      .expect(200);
    expect(res.body.data.pop().username).toBe('sys-admin'); // Last Data
    expect(res.body.data.pop().username).toBe('admin');
    expect(res.body.data.pop().username).toBe('courier');
  });

  it('/users (POST)', async () => {
    const auths = await getAuthHeader(adminUserMock);
    const res: request.Response = await request(app.getHttpServer())
      .post(`/users`)
      .send({
        username: 'user',
        password: 'pass',
        role: 'courier',
      })
      .set(...auths)
      .expect(201);
    expect(res.body.username).toBe('user');
    expect(res.body.password).toBeUndefined();
    expect(res.body.role).toBe('courier');
  });

  it('/users (POST) Fail', async () => {
    const auths = await getAuthHeader(adminUserMock);
    await request(app.getHttpServer())
      .post(`/users`)
      .send({
        username: 'user',
        password: 'pass',
        role: 'admin',
      })
      .set(...auths)
      .expect(401);
    await request(app.getHttpServer())
      .post(`/users`)
      .send({
        username: 'user',
        password: 'pass',
        role: 'other',
      })
      .set(...auths)
      .expect(400);
  });

  it('/users/:id (GET)', async () => {
    const auths = await getAuthHeader(sysAdminUserMock);
    const res: request.Response = await request(app.getHttpServer())
      .get(`/users/${adminUserMock.id}`)
      .set(...auths)
      .expect(200);
    expect(res.body.username).toBe('admin');
    expect(res.body.password).toBeUndefined();
  });

  it('/users/:id (GET) Fail', async () => {
    const auths = await getAuthHeader(adminUserMock);
    await request(app.getHttpServer())
      .get(`/users/${adminUserMock.id}`)
      .set(...auths)
      .expect(401);
  });
});
