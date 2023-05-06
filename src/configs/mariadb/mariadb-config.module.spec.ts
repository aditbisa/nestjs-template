import { Test } from '@nestjs/testing';

import { MariadbConfigService } from './mariadb-config.service';

describe('MariadbConfigModule', () => {
  let mariadbConfig: MariadbConfigService;

  it('should compile the module', async () => {
    // Set env vars
    process.env.MARIADB_USER = 'userdb';
    process.env.MARIADB_PASSWORD = 'secret';

    const { MariadbConfigModule } = await import('./mariadb-config.module');
    const module = await Test.createTestingModule({
      imports: [MariadbConfigModule],
    }).compile();
    expect(module).toBeDefined();

    mariadbConfig = module.get(MariadbConfigService);
    expect(mariadbConfig).toBeInstanceOf(MariadbConfigService);
  });

  it('should return value', async () => {
    // Default values
    expect(mariadbConfig.host).toBe('127.0.0.1');
    expect(mariadbConfig.port).toBe(5432);

    // Modified values
    expect(mariadbConfig.user).toBe('userdb');
    expect(mariadbConfig.password).toBe('secret');
  });
});
