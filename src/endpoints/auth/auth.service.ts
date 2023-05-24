import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtToken, TOKEN_TYPE } from '@schemas';
import { User, UserRepository } from '@models/user';
import { JwtConfigService } from '@configs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtConfig: JwtConfigService,
    private jwtService: JwtService,
  ) {}

  /**
   * Generate JWT Token for user.
   *
   * @param user - User entity.
   * @returns - JWT Token.
   */
  private async getJwtToken(user: User): Promise<JwtToken> {
    const payload = { sub: user.id, username: user.username };
    const access_token = await this.jwtService.signAsync(payload);
    const expires_in = this.jwtConfig.expiresIn;
    const token_type = TOKEN_TYPE;
    return { access_token, expires_in, token_type };
  }

  /**
   * SignIn user and return JWT Token.
   *
   * @param username
   * @param password
   * @returns - JWT Token.
   */
  async signIn(username: string, password: string): Promise<JwtToken> {
    const user = await this.userRepository.verify(username, password);
    if (user === false) {
      throw new UnauthorizedException();
    }
    return this.getJwtToken(user);
  }
}
