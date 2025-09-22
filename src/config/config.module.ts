// src/config/config.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvSchema } from './env.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // .env を読む（本番は環境から注入も可）
      envFilePath: ['.env'],
      // Zodで型＆必須チェック
      validate: (raw) => {
        const parsed = EnvSchema.safeParse(raw);
        if (!parsed.success) {
          const flat = parsed.error.flatten().fieldErrors;
          const msg = Object.entries(flat)
            .map(([k, v]) => `${k}: ${v?.join(', ')}`)
            .join(' | ');
          throw new Error(`Invalid environment variables → ${msg}`);
        }
        return parsed.data;
      },
    }),
  ],
})
export class AppConfigModule {}
