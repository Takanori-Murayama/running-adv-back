import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
  enableShutdownHooks(app: INestApplication) {
    // @ts-expect-error - Prisma v4+ では beforeExit の型定義が正しくないため
    this.$on('beforeExit', () => {
      void app.close();
    });
  }
}
