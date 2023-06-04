import { Controller, Get, Query } from '@nestjs/common';

import { JwtParsedPayload, PaginatedData, PaginatedParam } from '@schemas';
import { User } from '@models/user';
import { AuthRole, JwtParsePayload } from '@commons/decorators';
import { UsersService } from './users.service';
import { UserListDto } from './user.dto';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get()
  @AuthRole(['sys-admin', 'admin'])
  list(
    @Query() filter: UserListDto,
    @JwtParsePayload() tokenPayload: JwtParsedPayload,
  ): Promise<PaginatedData<User>> {
    return this.userService.list(tokenPayload.role, filter as PaginatedParam);
  }
}
