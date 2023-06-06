import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

import { PaginatedParam } from '@schemas';

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
