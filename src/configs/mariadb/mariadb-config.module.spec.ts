import { Test } from '@nestjs/testing';

import { MariadbConfigService } from './mariadb-config.service';

describe('MariadbConfigModule', () => {
  /**
   * We didn't test `.env` file as it will be inconsistent on different setup.
   */
  let config: MariadbConfigService;

  it('should compile the module', async () => {
    process.env.MARIADB_USER = 'userdb';
    process.env.MARIADB_PASSWORD = 'secret';

    const { MariadbConfigModule } = await import('./mariadb-config.module');
    const module = await Test.createTestingModule({
      imports: [MariadbConfigModule],
    }).compile();
    expect(module).toBeDefined();

    config = module.get(MariadbConfigService);
    expect(config).toBeInstanceOf(MariadbConfigService);
  });

  it('should return value', async () => {
    expect(config.user).toBe('userdb');
    expect(config.password).toBe('secret');
  });
});
