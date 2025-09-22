// src/auth/google.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: config.get<string>('GOOGLE_CALLBACK_URL')!, // http://localhost:3030/api/auth/google/callback
      scope: ['profile', 'email'],
      passReqToCallback: false,
    });
  }

  async validate(_, __, profile: Profile, done: VerifyCallback) {
    console.log('[validate] start, profile.id=', profile.id);
    try {
      const user = await this.authService.upsertGoogleUser(profile);
      const safe = {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        photoUrl: user.photoUrl,
      };
      console.log('[validate] return user.id=', safe.id);
      return done(null, safe); // ← return と混在させない
    } catch (e) {
      console.error('[validate] error', e);
      return done(e, undefined);
    }
  }
}
