import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { AppModule } from '@src/app.module';
import { UserModule, UserRepository } from '@models/user';

const userMock = {
  username: 'a-user',
  password: 'secret',
};

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule, UserModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const userRepo = moduleFixture.get(UserRepository);
    await userRepo.create({ ...userMock });
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: userMock.username,
        password: userMock.password,
      })
      .expect(200)
      .expect('jwt-token');
  });
});
