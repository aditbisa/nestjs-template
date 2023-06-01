import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';

import { UserRepositoryModule } from '@models/user';
import { JwtConfigModule, JwtConfigService } from '@configs/jwt';
import { AuthGuard } from '@commons/guards';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    UserRepositoryModule,
    JwtConfigModule,
    JwtModule.registerAsync({
      imports: [JwtConfigModule],
      inject: [JwtConfigService],
      useFactory: (jwtConfig: JwtConfigService) => {
        const options: JwtModuleOptions = {
          global: true,
          secret: jwtConfig.secret,
          signOptions: {
            expiresIn: jwtConfig.expiresIn,
          },
        };
        return options;
      },
    }),
  ],
  providers: [
    AuthService,
    { provide: APP_GUARD, useClass: AuthGuard }, // This AuthGuard became global
  ],
  controllers: [AuthController],
})
export class AuthModule {}
