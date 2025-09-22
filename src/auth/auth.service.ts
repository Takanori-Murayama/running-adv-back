import * as argon2 from 'argon2';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Profile } from 'passport-google-oauth20';
import type { User } from '@prisma/client';
import { RegisterDto, LoginDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async registerLocal(dto: RegisterDto): Promise<User> {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email already in use');

    const hash = await argon2.hash(dto.password, { type: argon2.argon2id });
    return this.prisma.user.create({
      data: {
        provider: 'local',
        email: dto.email,
        displayName: dto.displayName,
        passwordHash: hash,
      },
    });
  }

  async validateLocal(dto: LoginDto): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !user.passwordHash)
      throw new UnauthorizedException('Invalid credentials');

    const ok = await argon2.verify(user.passwordHash, dto.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  /**
   * Google のプロフィールからユーザーを作成/更新して返す。
   * 返り値は Passport により req.user にセットされ、SessionSerializer の serializeUser へ渡る。
   */
  /* eslint-disable @typescript-eslint/no-unsafe-member-access */
  async upsertGoogleUser(profile: Profile): Promise<User> {
    // 型安全性を確保するため明示的に型変換
    const email: string | null =
      profile.emails && profile.emails[0]
        ? String(profile.emails[0].value)
        : null;
    const displayName: string | null = profile.displayName
      ? String(profile.displayName)
      : null;
    const photoUrl: string | null =
      profile.photos && profile.photos[0]
        ? String(profile.photos[0].value)
        : null;

    const provider = 'google';
    const providerId: string = String(profile.id); // Google の一意ID（sub）

    // 1) provider+providerId で既存を探す
    const existing = await this.prisma.user.findFirst({
      where: { provider, providerId },
    });

    if (existing) {
      // 2) 既存なら最新情報で軽く更新
      return this.prisma.user.update({
        where: { id: existing.id },
        data: { email, displayName, photoUrl, isActive: true },
      });
    }

    // 3) なければ新規作成
    // email は null の可能性がある（Google側の設定・権限で非提供のことがある）
    return this.prisma.user.create({
      data: {
        provider,
        providerId,
        email,
        displayName,
        photoUrl,
        role: 'USER', // デフォルトの役割を設定
        category: 'RUNNER', // デフォルトのカテゴリを設定
      },
    });
  }
  /* eslint-enable @typescript-eslint/no-unsafe-member-access */

  /**
   * セッション復元用（SessionSerializer から呼ばれる）
   */
  async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
