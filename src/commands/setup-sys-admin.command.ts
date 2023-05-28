import { Module } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';

import { UserModule, UserRepository } from '@models/user';

@Command({
  name: 'sa',
  description: 'Create or replace existing SysAdmin credentials.',
  arguments: '<username>',
})
export class SetupSysAdminCommand extends CommandRunner {
  constructor(private userRepository: UserRepository) {
    super();
  }

  async run(passedParam: string[]): Promise<void> {
    const username = passedParam[0]; // Validated by Command.arguments
    const password = Math.random().toString(36).substring(2, 10); // Random 8-char

    let user;
    const current = await this.userRepository.findOne(
      { role: 'sys-admin' },
      false,
    );
    if (current) {
      user = await this.userRepository.update(current.id, {
        username,
        password,
      });
    } else {
      user = await this.userRepository.create({
        username,
        password,
        role: 'sys-admin',
      });
    }

    console.log(`SysAdmin created:\nId = ${user.id}\nPassword = ${password}`);
  }
}

@Module({
  imports: [UserModule],
  providers: [SetupSysAdminCommand],
})
export class SetupSysAdminModule {}
