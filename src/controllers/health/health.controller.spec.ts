import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigOptions, TypeOrmAsyncOptions } from '@test/configs.spec';
import { HealthModule } from './health.module';

describe('HealthModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(ConfigOptions),
        TypeOrmModule.forRootAsync(TypeOrmAsyncOptions),
        HealthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({
        status: 'ok',
        info: {
          database: {
            status: 'up',
          },
        },
        error: {},
        details: {
          database: {
            status: 'up',
          },
        },
      });
  });
});
