import { Module } from '@nestjs/common';

import { UserRepository } from './user.repository';
import { AppConfigModule } from '@configs/app';

@Module({
  imports: [AppConfigModule],
  providers: [UserRepository],
  exports: [UserRepository],
})
export class UserModule {}
