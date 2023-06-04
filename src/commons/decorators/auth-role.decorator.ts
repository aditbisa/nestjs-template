import { SetMetadata } from '@nestjs/common';

import { UserRole } from '@schemas';

export const AUTH_ROLE = 'roles';
export const AuthRole = (roles: UserRole[]) => SetMetadata(AUTH_ROLE, roles);
