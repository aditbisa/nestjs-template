import { Test } from '@nestjs/testing';

import { AppConfigService } from './app-config.service';

describe('AppConfigModule', () => {
  let appConfig: AppConfigService;

  it('should compile the module', async () => {
    // Set env vars
    process.env.APP_NAME = 'Pesat System';
    process.env.APP_URL = 'https://test:3000';

    const { AppConfigModule } = await import('./app-config.module');
    const module = await Test.createTestingModule({
      imports: [AppConfigModule],
    }).compile();
    expect(module).toBeDefined();

    appConfig = module.get(AppConfigService);
    expect(appConfig).toBeInstanceOf(AppConfigService);
  });

  it('should return value', async () => {
    // Default values
    expect(appConfig.description).toBe('');
    expect(appConfig.port).toBe(3000);

    // Modified values
    expect(appConfig.name).toBe('Pesat System');
    expect(appConfig.url).toBe('https://test:3000');
  });
});
