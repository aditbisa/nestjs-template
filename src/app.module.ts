import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from '@configs/app';
import { MariadbConfigModule, MariadbConfigService } from '@configs/mariadb';
import { ENTITIES } from '@models/entities';
import { HealthModule } from '@endpoints/health';
import { AuthModule } from '@endpoints/auth';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [MariadbConfigModule],
      inject: [MariadbConfigService],
      useFactory: (config: MariadbConfigService) => {
        const options: TypeOrmModuleOptions = {
          type: 'mariadb',
          connectorPackage: 'mysql2',
          host: config.host,
          port: config.port,
          username: config.user,
          password: config.password,
          database: config.database,
          entities: ENTITIES,
          synchronize: true, // remove on prod and use migration
          timezone: 'Z',
        };
        return options;
      },
    }),
    AppConfigModule,
    HealthModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
