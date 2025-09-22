// src/auth/session.serializer.ts
import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';

// Express.User の型を入れたいなら拡張してOK（必須ではない）
export type SessionUser = { id: string };

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  // セッションに保存する最小情報（idのみが安全）
  serializeUser(user: any, done: (err: any, id?: unknown) => void) {
    console.log('[serializeUser] user.id=', user?.id);
    done(null, user.id);
  }

  // セッションから復元（DBからユーザーを取得）
  async deserializeUser(id: string, done: (err: any, user?: any) => void) {
    console.log('[deserializeUser] id=', id);
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) return done(null, false);
      // ここでパスワードハッシュ等は除外して“APIで返して良い形”に整える
      const safeUser = {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        photoUrl: (user as any).photoUrl ?? undefined,
      };
      done(null, safeUser);
    } catch (e) {
      done(e);
    }
  }
}
