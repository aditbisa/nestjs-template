import 'tsconfig-paths/register';
import { DataSource } from 'typeorm';

import { User } from '@models/user';

const MARIADB_DATABASE = 'pesat_test';
const USER_TABLE = 'users';
process.env.MARIADB_DATABASE = MARIADB_DATABASE;

export default async function setup() {
  const ds = new DataSource({
    type: 'mariadb',
    connectorPackage: 'mysql2',
    host: process.env.MARIADB_HOST,
    port: Number(process.env.MARIADB_PORT),
    username: 'root',
    password: 'root',
    database: MARIADB_DATABASE,
    entities: [User],
  });

  try {
    await ds.initialize();
    await ds.synchronize(true);

    // Setup user 'mariadb'.
    await ds.query(`GRANT ALL ON \`${MARIADB_DATABASE}\`.* TO 'mariadb'@'%'`);
    await ds.query(`FLUSH PRIVILEGES`);

    // The password will be a hash string of the username.
    await ds.query(`INSERT INTO
      \`${MARIADB_DATABASE}\`.\`${USER_TABLE}\` (id, username, password, role, lastLoginAt)
      VALUES
      (1, 'sys-admin', '', 'sys-admin', NOW()),
      (2, 'admin', '', 'admin', NOW()),
      (3, 'courier', '', 'courier', NOW())
    `);
  } catch (err) {
    console.error('Setup Error', err);
  }
  await ds.destroy();
}
