// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Get,
  Req,
  Res,
  UseGuards,
  Body,
  HttpCode,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { LoginDto, RegisterDto } from './dto/register.dto';
import { AuthUserDto } from './dto/user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';

// エラーを適切に文字列化するヘルパー関数
const errorToString = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return JSON.stringify(error);
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    // Googleにリダイレクト
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const origin = this.config.get<string>(
      'FRONTEND_ORIGIN',
      'http://localhost:3000',
    );
    const fallback = this.config.get<string>('LOGIN_REDIRECT_PATH', '/');
    const raw =
      typeof req.query.returnTo === 'string' ? req.query.returnTo : '';
    const decoded = (() => {
      try {
        return decodeURIComponent(raw);
      } catch {
        return raw;
      }
    })();
    const returnTo = decoded && decoded.startsWith('/') ? decoded : fallback;

    // ★ ここを「常に」実行して、セッションへ書き込む（passport.serializeUser を強制）
    if (req.user) {
      await new Promise<void>((ok, ng) =>
        req.logIn(req.user!, (e: unknown) =>
          e ? ng(e instanceof Error ? e : new Error(errorToString(e))) : ok(),
        ),
      );
    }

    // ★ ここまでで何が入っているかを出す
    console.log(
      '[cb] pre  isAuth=',
      req.isAuthenticated?.(),
      'user=',
      req.user,
    );
    console.log(
      '[cb] pre  sessionID=',
      req.sessionID,
      'passport=',
      req.session?.passport,
    );

    // ① GuardがlogInできていない場合に備え、手動でlogIn
    if (!req.isAuthenticated?.() && req.user) {
      await new Promise<void>((ok, ng) =>
        req.logIn(req.user!, (e: unknown) =>
          e ? ng(e instanceof Error ? e : new Error(errorToString(e))) : ok(),
        ),
      );
      console.log('[cb] did req.logIn(): passport=', req.session?.passport);
    }

    // ★ save 直前のセッション中身
    console.log(
      '[cb] before save: isAuth=',
      req.isAuthenticated?.(),
      'passport=',
      req.session?.passport,
    );

    req.session.save(() => {
      console.log('[callback] session saved, redirecting');
      res.redirect(`${origin}${returnTo}`);
    });
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  async login(
    @Body() body: LoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // ここに来た時点で req.user は LocalStrategy.validate() の戻り値
    if (!body.email && !body.password)
      return res.status(401).json({ message: 'Unauthorized' });

    // セッションへ書き込む（必要なら。passport.serializeUser が呼ばれる）
    if (req.user) {
      await new Promise<void>((ok, ng) =>
        req.logIn(req.user!, (e: unknown) =>
          e ? ng(e instanceof Error ? e : new Error(errorToString(e))) : ok(),
        ),
      );
    }

    req.session.save(() => {
      res.status(200).json(req.user);
    });
  }

  @Post('logout')
  @HttpCode(204) // 返却ボディ不要
  async logout(@Req() req: Request, @Res() res: Response) {
    // 1) passport のログアウト（req.user を外す）
    await new Promise<void>((ok, ng) =>
      // passport@0.6 以降はコールバック必須
      req.logout((err: unknown) =>
        err
          ? ng(err instanceof Error ? err : new Error(errorToString(err)))
          : ok(),
      ),
    );

    // 2) セッション破棄（store からも削除）
    await new Promise<void>((ok, ng) =>
      req.session.destroy((err) =>
        err
          ? ng(err instanceof Error ? err : new Error(errorToString(err)))
          : ok(),
      ),
    );

    // 3) セッションクッキーを明示的に無効化
    //    ※ cookie 名は express-session のデフォルト 'connect.sid'
    res.clearCookie('connect.sid', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax', // 本番で分離ドメインなら 'none'
      secure: false, // 本番 https なら true
    });

    // 4) 終了（204 No Content）
    res.end();
  }

  @Post('register')
  @ApiCreatedResponse({ type: AuthUserDto })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // ユーザー登録処理 DBに新規ユーザーを追加
    const { email, password, displayName } = dto;
    if (!email || !password || !displayName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    console.log('Registering user:', email, displayName);

    // ここでDBにユーザーを追加する処理を実装
    await this.authService.registerLocal({ email, password, displayName });
    // 登録完了後にメールを送信
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Running Ads',
      text: `Hello ${displayName},\n\nThank you for registering at Running Ads! We're excited to have you on board.\n\nBest regards,\nThe Running Ads Team`,
    });

    // 既存ユーザーのチェックやパスワードハッシュ化などもここで行うべきです
    return res.sendStatus(201);
  }
}
