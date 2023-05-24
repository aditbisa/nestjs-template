import { Test } from '@nestjs/testing';

import { JwtConfigService } from './jwt.service';

describe('JwtConfigModule', () => {
  /**
   * We didn't test `.env` file as it will be inconsistent on different setup.
   */
  let config: JwtConfigService;

  it('should compile the module', async () => {
    process.env.JWT_SECRET = 'secret';
    process.env.JWT_EXPIRES_IN = '3600';

    const { JwtConfigModule } = await import('./jwt.module');
    const module = await Test.createTestingModule({
      imports: [JwtConfigModule],
    }).compile();
    expect(module).toBeDefined();

    config = module.get(JwtConfigService);
    expect(config).toBeInstanceOf(JwtConfigService);
  });

  it('should return value', async () => {
    expect(config.secret).toBe('secret');
    expect(config.expiresIn).toBe(3600);
  });
});
