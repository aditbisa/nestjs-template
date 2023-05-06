import { Module } from '@nestjs/common';

import { AppConfig, AppConfigSchema } from './app.config';
import { AppConfigService } from './app-config.service';
import { ConfigModule } from '@nestjs/config';

/**
 * Import and provide app configuration related classes.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [AppConfig],
      validationSchema: AppConfigSchema,
      cache: true,
      expandVariables: true,
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
