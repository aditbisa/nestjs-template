import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import { AppModule } from '@src/app.module';
import { User, UserRepositoryModule, UserRepository } from '@models/user';
import { AuthModule, AuthService } from '@endpoints/auth';

const sysAdminUserMock = {
  id: null,
  username: 'sys-admin',
  password: 'sys-admin',
  role: 'sys-admin',
} as User;
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
      const user = await userRepo.create({ ...userMock });
      userMock.id = user.id;
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
    expect(res.body.data[0].username).toBe('courier');
    expect(res.body.data[1].username).toBe('admin');
    expect(res.body.data[2].username).toBe('sys-admin');
  });
});
