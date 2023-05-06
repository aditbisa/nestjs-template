import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MariadbConfigModule, MariadbConfigService } from '@configs/mariadb';
import { HealthModule } from '@controllers/health';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [MariadbConfigModule],
      inject: [MariadbConfigService],
      useFactory: (config: MariadbConfigService) => ({
        type: 'mariadb',
        connectorPackage: 'mysql2',
        host: config.host,
        port: config.port,
        username: config.user,
        password: config.password,
        database: config.database,
        entities: [],
        synchronize: true, // remove on prod and use migration
        timezone: '+07:00', // Jakarta
      }),
    }),
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
