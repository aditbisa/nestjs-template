import {
  ConfigModule,
  ConfigModuleOptions,
  ConfigService,
} from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const ConfigOptions: ConfigModuleOptions = {
  envFilePath: ['.env.test', '.env'],
};

export const TypeOrmAsyncOptions: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'mariadb',
    connectorPackage: 'mysql2',
    host: config.get<string>('MARIADB_HOST'),
    port: Number(config.get<number>('MARIADB_PORT')),
    username: config.get<string>('MARIADB_USER'),
    password: config.get<string>('MARIADB_PASSWORD'),
    database: config.get<string>('MARIADB_DATABASE'),
    entities: [],
    synchronize: true,
    dropSchema: true,
    timezone: '+07:00', // Jakarta
  }),
};
