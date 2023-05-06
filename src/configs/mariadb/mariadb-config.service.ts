import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Configuration service.
 */
@Injectable()
export class MariadbConfigService {
  constructor(private configService: ConfigService) {}

  get host(): string {
    return this.configService.get<string>('mariadb.host');
  }
  get port(): number {
    return Number(this.configService.get<number>('mariadb.port'));
  }
  get user(): string {
    return this.configService.get<string>('mariadb.user');
  }
  get password(): string {
    return this.configService.get<string>('mariadb.password');
  }
  get database(): string {
    return this.configService.get<string>('mariadb.database');
  }
}
