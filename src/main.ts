import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { AppConfigService } from '@configs/app';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appConfig = app.get(AppConfigService);

  // Auto validation for all endpoints.
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(appConfig.port);
}
bootstrap();
