import { Module } from '@nestjs/common';
import { CommandFactory } from 'nest-commander';

import { AppModule } from '@src/app.module';
import { SetupSysAdminModule } from '@commands';

@Module({ imports: [AppModule, SetupSysAdminModule] })
class CmdModule {}

async function bootstrap() {
  try {
    await CommandFactory.run(CmdModule, ['warn', 'error']);
  } catch (err) {
    console.error('Command error', err);
  }
}
bootstrap();
