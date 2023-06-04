import { Injectable } from '@nestjs/common';
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
}
