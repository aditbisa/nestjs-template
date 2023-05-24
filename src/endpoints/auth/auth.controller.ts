import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';

import { JwtToken, JwtParsedPayload } from '@schemas';
import { JwtParsePayload, Public } from '@commons/decorators';
import { AuthService } from './auth.service';
import { SignInDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Sign In handler.
   *
   * @param signInDto
   * @returns - JWT Token.
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: SignInDto): Promise<JwtToken> {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  /**
   * Get user profile.
   *
   * @param tokenPayload - JWT token parsed payload.
   * @returns - User profile.
   */
  @Get('profile')
  getProfile(@JwtParsePayload() tokenPayload: JwtParsedPayload) {
    /** @todo Get more info from database. */
    return tokenPayload;
  }
}
