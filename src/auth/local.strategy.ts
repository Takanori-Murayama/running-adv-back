import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as argon2 from 'argon2';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly users: UsersService) {
    // ← デフォルトは username/password なので、email を使うなら必ず指定
    super({ usernameField: 'email', passwordField: 'password' });
  }

  async validate(email: string, password: string) {
    // 1) emailでユーザーを取得（※ passwordでSQL一致検索はしない）
    console.log('[local] email=', email);
    const user = await this.users.findByEmail(email);
    console.log('[local] user=', !!user);
    if (!user) throw new UnauthorizedException();

    // 2) ハッシュ検証
    const ok = await argon2.verify(user.passwordHash || '', password);
    console.log('[local] ok=', ok);
    if (!ok) throw new UnauthorizedException();

    // 3) セッションへ入れたい形で返す（パスワードは除外）
    // 返した値が req.user になります
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
