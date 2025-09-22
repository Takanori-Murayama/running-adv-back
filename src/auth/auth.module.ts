// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { GoogleStrategy } from './google.strategy';
import { SessionSerializer } from './session.serializer';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthenticatedGuard } from './authenticated.guard';
import { LocalStrategy } from './local.strategy';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [UsersModule, PassportModule.register({ session: true })],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersService,
    GoogleStrategy,
    SessionSerializer,
    PrismaService,
    AuthenticatedGuard,
    LocalStrategy,
  ],
})
export class AuthModule {}
