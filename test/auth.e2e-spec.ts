import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { AppModule } from '@src/app.module';
import { User, UserRepositoryModule, UserRepository } from '@models/user';

const userMock = {
  username: 'username',
  password: 'password',
  role: 'courier',
} as User;

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule, UserRepositoryModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const userRepo = moduleFixture.get(UserRepository);
    await userRepo.create({ ...userMock });
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/login (POST)', async () => {
    const res: request.Response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: userMock.username,
        password: userMock.password,
      })
      .expect(200);
    expect(res.body.access_token).toBeTruthy();
  });

  it('/auth/profile (GET)', async () => {
    const res1: request.Response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: userMock.username,
        password: userMock.password,
      });
    const token = res1.body.access_token;

    const res2: request.Response = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res2.body.username).toBe(userMock.username);
  });
});
