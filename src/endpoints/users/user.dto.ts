import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

import { PaginatedParam } from '@schemas';

/**
 * List request parameter.
 */
export class UserListDto implements PaginatedParam {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  countPerPage = 50;
}
