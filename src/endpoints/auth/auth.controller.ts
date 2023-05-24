import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';

import { JwtToken } from '@schemas';
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
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: SignInDto): Promise<JwtToken> {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }
}
