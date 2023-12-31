import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { JwtParsedPayload, PaginatedData, PaginatedParam } from '@schemas';
import { User } from '@models/user';
import { AuthRole, JwtParsePayload } from '@commons/decorators';
import { UsersService } from './users.service';
import { UserCreateDto, UserListDto } from './user.dto';

@Controller('users')
@AuthRole(['sys-admin', 'admin'])
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get()
  list(
    @Query() filter: UserListDto,
    @JwtParsePayload() tokenPayload: JwtParsedPayload,
  ): Promise<PaginatedData<User>> {
    return this.userService.list(tokenPayload.role, filter as PaginatedParam);
  }

  @Post()
  create(
    @Body() payload: UserCreateDto,
    @JwtParsePayload() tokenPayload: JwtParsedPayload,
  ): Promise<User> {
    return this.userService.create(tokenPayload.role, payload);
  }

  @Get(':id')
  view(
    @Param('id') userId: number,
    @JwtParsePayload() tokenPayload: JwtParsedPayload,
  ): Promise<User> {
    return this.userService.findOne(tokenPayload.role, userId);
  }
}
