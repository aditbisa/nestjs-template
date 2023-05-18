import { DataSource } from 'typeorm';

const MARIADB_DATABASE = 'pesat_test';
process.env.MARIADB_DATABASE = MARIADB_DATABASE;

export default async function setup() {
  const ds = new DataSource({
    type: 'mariadb',
    connectorPackage: 'mysql2',
    host: process.env.MARIADB_HOST,
    port: Number(process.env.MARIADB_PORT),
    username: 'root',
    password: 'root',
  });

  try {
    await ds.initialize();
    await ds.query(`DROP DATABASE IF EXISTS \`${MARIADB_DATABASE}\``);
    await ds.query(`CREATE DATABASE IF NOT EXISTS \`${MARIADB_DATABASE}\``);
    await ds.query(`GRANT ALL ON \`${MARIADB_DATABASE}\`.* TO 'mariadb'@'%'`);
    await ds.query(`FLUSH PRIVILEGES`);
  } catch (err) {
    console.error('Setup Error', err);
  }
  await ds.destroy();
}
