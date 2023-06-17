import { Type } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

import { PaginatedParam, UserRole } from '@schemas';
import { User } from '@models/user';

/**
 * List request parameter.
 */
export class UserListDto implements PaginatedParam {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  countPerPage = 50;
}

/**
 * Create request parameter.
 */
export class UserCreateDto
  implements Pick<User, 'username' | 'password' | 'role'>
{
  @IsString()
  @Length(4, 25)
  username: string;

  @IsString()
  @Length(4, 25)
  password: string;

  @IsIn(['admin', 'courier', 'helper'])
  role: UserRole;
}
