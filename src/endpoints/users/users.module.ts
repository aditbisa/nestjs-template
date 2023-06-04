import { Module } from '@nestjs/common';

import { UserRepositoryModule } from '@models/user';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [UserRepositoryModule],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
