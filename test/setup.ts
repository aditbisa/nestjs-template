import { DataSource } from 'typeorm';

process.env.MARIADB_DATABASE = 'pesat_test';

export default async function setup() {
  const dataSource = new DataSource({
    type: 'mariadb',
    connectorPackage: 'mysql2',
    host: process.env.MARIADB_HOST,
    port: Number(process.env.MARIADB_PORT),
    username: 'root',
    password: 'root',
  });

  try {
    await dataSource.initialize();
    await dataSource.query('CREATE DATABASE IF NOT EXISTS `pesat_test`');
    await dataSource.query("GRANT ALL ON `pesat_test`.* TO 'mariadb'@'%'");
    await dataSource.query('FLUSH PRIVILEGES');
  } catch (err) {
    console.error('Setup Error', err);
  }
  await dataSource.destroy();
}
