import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import { AppModule } from '@src/app.module';
import { User, UserRepositoryModule, UserRepository } from '@models/user';

const courierUserMock = {
  id: 3,
  username: 'courier',
  password: 'courier',
  role: 'courier',
} as User;

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule, UserRepositoryModule],
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
    await userRepo.update(courierUserMock.id, {
      password: courierUserMock.username,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/login (POST)', async () => {
    const res: request.Response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: courierUserMock.username,
        password: courierUserMock.password,
      })
      .expect(200);
    expect(res.body.access_token).toBeTruthy();
  });

  it('/auth/profile (GET)', async () => {
    const res1: request.Response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: courierUserMock.username,
        password: courierUserMock.password,
      });
    const token = res1.body.access_token;

    const res2: request.Response = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res2.body.username).toBe(courierUserMock.username);
  });
});
