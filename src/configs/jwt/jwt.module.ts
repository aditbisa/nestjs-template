import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { JwtConfig, JwtConfigSchema } from './jwt.config';
import { JwtConfigService } from './jwt.service';

/**
 * Import and provide app configuration related classes.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [JwtConfig],
      validationSchema: JwtConfigSchema,
      cache: true,
      expandVariables: true,
    }),
  ],
  providers: [JwtConfigService],
  exports: [JwtConfigService],
})
export class JwtConfigModule {}
