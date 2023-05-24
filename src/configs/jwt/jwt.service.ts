import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Configuration service.
 */
@Injectable()
export class JwtConfigService {
  constructor(private configService: ConfigService) {}

  get secret(): string {
    return this.configService.get<string>('jwt.secret');
  }
  get expiresIn(): number {
    return Number(this.configService.get<number>('jwt.expiresIn'));
  }
}
