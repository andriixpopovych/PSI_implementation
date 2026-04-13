import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthenticatedGuard } from '../common/auth/authenticated.guard';
import { LocalAuthGuard } from '../common/auth/local-auth.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [PrismaModule, PassportModule.register({ session: true })],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, SessionSerializer, AuthenticatedGuard, LocalAuthGuard],
  exports: [AuthService, AuthenticatedGuard, LocalAuthGuard, PassportModule],
})
export class AuthModule {}
