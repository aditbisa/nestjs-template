import { Test } from '@nestjs/testing';

import { AppConfigService } from './app-config.service';

describe('AppConfigModule', () => {
  /**
   * We didn't test `.env` file as it will be inconsistent on different setup.
   */
  let config: AppConfigService;

  it('should compile the module', async () => {
    process.env.APP_NAME = 'Pesat System';
    process.env.APP_URL = 'https://test:3000';

    const { AppConfigModule } = await import('./app-config.module');
    const module = await Test.createTestingModule({
      imports: [AppConfigModule],
    }).compile();
    expect(module).toBeDefined();

    config = module.get(AppConfigService);
    expect(config).toBeInstanceOf(AppConfigService);
  });

  it('should return value', async () => {
    expect(config.name).toBe('Pesat System');
    expect(config.url).toBe('https://test:3000');
  });
});
