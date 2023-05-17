import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'mariadb',
  connectorPackage: 'mysql2',
  host: process.env.MARIADB_HOST,
  port: Number(process.env.MARIADB_PORT),
  username: process.env.MARIADB_USER,
  password: process.env.MARIADB_PASSWORD,
  database: process.env.MARIADB_DATABASE,
  entities: [],
  timezone: 'Z',
  migrations: ['@migrations/scripts/*'],
});
