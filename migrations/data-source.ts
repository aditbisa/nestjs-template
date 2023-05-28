import { DataSource } from 'typeorm';
import 'dotenv/config';

import { ENTITIES } from '@models/entities';

export default new DataSource({
  type: 'mariadb',
  connectorPackage: 'mysql2',
  host: process.env.MARIADB_HOST,
  port: Number(process.env.MARIADB_PORT),
  username: process.env.MARIADB_USER,
  password: process.env.MARIADB_PASSWORD,
  database: process.env.MARIADB_DATABASE,
  entities: ENTITIES,
  timezone: 'Z',
  migrations: ['@migrations/scripts/*'],
});
