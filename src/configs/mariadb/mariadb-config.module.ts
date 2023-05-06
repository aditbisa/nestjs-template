import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MariadbConfig, MariadbConfigSchema } from './mariadb.config';
import { MariadbConfigService } from './mariadb-config.service';

/**
 * Import and provide app configuration related classes.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [MariadbConfig],
      validationSchema: MariadbConfigSchema,
      cache: true,
      expandVariables: true,
    }),
  ],
  providers: [MariadbConfigService],
  exports: [MariadbConfigService],
})
export class MariadbConfigModule {}
