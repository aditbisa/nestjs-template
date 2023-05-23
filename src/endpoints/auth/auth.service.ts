import { Injectable, UnauthorizedException } from '@nestjs/common';

import { UserRepository } from '@models/user';

@Injectable()
export class AuthService {
  constructor(private userRepository: UserRepository) {}

  /**
   * SignIn user and return JWT Token.
   *
   * @param username
   * @param password
   * @returns - JWT Token.
   */
  async signIn(username: string, password: string): Promise<string> {
    const user = await this.userRepository.verify(username, password);
    if (user === false) {
      throw new UnauthorizedException();
    }

    return 'jwt-token';
  }
}
