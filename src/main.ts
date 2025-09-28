// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import session from 'express-session';
import passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // API の共通プレフィックス
  app.setGlobalPrefix('api');

  // DTOバリデーション（不要フィールド除去＆変換）
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, // ← クエリ/パラメータの型変換を有効に（Number化など）
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS（フロント分離の場合は適切に制限）
  app.enableCors({
    origin: ['http://localhost:3000'], // フロントのURL
    credentials: true,
  });

  // Swagger (開発/検証のみ)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Running Ads API')
      .setDescription('API documentation')
      .setVersion('0.1.0')
      // 先に Bearer を定義（後でJWT実装）
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  console.log(`✅ Server running on http://localhost:${port}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📚 Swagger UI:      http://localhost:${port}/docs`);
  }

  app.useGlobalFilters(new HttpExceptionFilter());

  // Cookie-Session
  app.use(
    session({
      secret: process.env.SESSION_SECRET ?? 'change-me',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // 本番はtrue
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7日
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());
  // app.set('trust proxy', 1); // 本番でプロキシ越えの場合

  await app.listen(port, '0.0.0.0');
}
bootstrap();
