import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AppConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RunnerModule } from './runners/runner.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    AppConfigModule,
    ConfigModule.forRoot({ envFilePath: ['.env'], isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        // 本番は JSON / 開発は pretty
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  singleLine: false,
                  translateTime: 'HH:MM:ss.l',
                  colorize: true,
                },
              }
            : undefined,
        // リクエストIDなど欲しければここで生成
        // genReqId: (req) => req.headers['x-request-id'] ?? randomUUID(),
        autoLogging: true,
        serializers: {
          req(req) {
            return {
              method: req.method,
              url: req.url,
              // headers 等は必要に応じて
            };
          },
        },
      },
    }),
    PrismaModule,
    AuthModule,
    RunnerModule,
    UsersModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST ?? 'localhost', // コンテナ外なら localhost / 同一compose内なら 'mailhog'
        port: Number(process.env.SMTP_PORT ?? 1025),
        secure: false,
        ignoreTLS: true,
      },
      defaults: {
        from: '"Running Ads Dev" <noreply@dev.local>',
      },
    }),
  ],
})
export class AppModule {}
