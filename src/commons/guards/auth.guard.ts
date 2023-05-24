import { Reflector } from '@nestjs/core';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { JWT_PAYLOAD_REQUEST_KEY, JWT_TOKEN_TYPE } from '@schemas';
import { IS_PUBLIC_KEY } from '@commons/decorators';

@Injectable()
export class AuthGuard implements CanActivate {
  /**
   * This AuthGuard became global once set into AuthModule.
   */
  constructor(private jwtService: JwtService, private reflector: Reflector) {}

  /**
   * Guard handler.
   * Register token payload into request as JWT_PAYLOAD_REQUEST_KEY.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request[JWT_PAYLOAD_REQUEST_KEY] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  /**
   * Extract token from headers.
   *
   * @param request
   * @returns - The token.
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === JWT_TOKEN_TYPE ? token : undefined;
  }
}
