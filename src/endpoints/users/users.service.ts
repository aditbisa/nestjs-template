import { Injectable, UnauthorizedException } from '@nestjs/common';
import { In } from 'typeorm';

import { PaginatedData, PaginatedParam, UserRole } from '@schemas';
import { User, UserRepository } from '@models/user';

@Injectable()
export class UsersService {
  constructor(private userRepository: UserRepository) {}

  /**
   * Get managed user roles by user role.
   */
  private managedUserRoles(authUserRole: UserRole): UserRole[] {
    switch (authUserRole) {
      case 'sys-admin':
        return ['sys-admin', 'admin', 'courier', 'helper'];
      case 'admin':
        return ['courier', 'helper'];
      default:
        return [];
    }
  }

  /**
   * Query list of users.
   *
   * @param authUserRole - Current active user role for filtering.
   * @param paginatedParam - Param for pagination.
   * @return - Paginated users data.
   */
  list(
    authUserRole: UserRole,
    paginatedParam: PaginatedParam,
  ): Promise<PaginatedData<User>> {
    const roles = this.managedUserRoles(authUserRole);
    return this.userRepository.findPaginated(paginatedParam, {
      role: In(roles),
    });
  }

  /**
   * Create a new user.
   *
   * @param authUserRole - Current active user role.
   * @param inputs - New user data.
   * @returns - User entity.
   */
  async create(
    authUserRole: UserRole,
    inputs: Pick<User, 'username' | 'password' | 'role'>,
  ): Promise<User> {
    const roles = this.managedUserRoles(authUserRole);
    if (!roles.includes(inputs.role)) {
      throw new UnauthorizedException();
    }
    return this.userRepository.create(inputs);
  }

  /**
   * Find user by Id.
   *
   * @param authUserRole - Current active user role.
   * @param userId
   * @returns - User entity.
   */
  async findOne(authUserRole: UserRole, userId: User['id']): Promise<User> {
    const roles = this.managedUserRoles(authUserRole);
    const user = await this.userRepository.findOne(userId, true);
    if (!roles.includes(user.role)) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
