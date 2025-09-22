import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRunnerDto } from './dto/create-runner.dto';
import { UpdateRunnerDto } from './dto/update-runner.dto';

@Injectable()
export class RunnerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateRunnerDto) {
    // userId 1:1。既存があればエラーにする（フロント都合で upsert したければ変更）
    const exists = await this.prisma.runner.findUnique({ where: { userId } });
    if (exists) throw new ForbiddenException('Runner already exists');

    return this.prisma.runner.create({
      data: { userId, ...dto },
    });
  }

  async findPublicList(params: {
    page?: number;
    limit?: number;
    area?: string;
    q?: string;
  }) {
    const { page = 1, limit = 20, area, q } = params;
    const where: any = { isPublic: true };
    if (area) where.area = area;
    if (q) {
      where.OR = [
        { displayName: { contains: q, mode: 'insensitive' } },
        { bio: { contains: q, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await this.prisma.$transaction([
      this.prisma.runner.findMany({
        where,
        skip: (page - 1) * limit,
        take: Math.min(limit, 100),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.runner.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findOnePublicOrOwned(id: string, requesterId?: string) {
    const r = await this.prisma.runner.findUnique({ where: { id } });
    if (!r) throw new NotFoundException();
    if (r.isPublic) return r;
    if (requesterId && r.userId === requesterId) return r;
    throw new NotFoundException(); // 非公開は存在を伏せる
  }

  async update(id: string, requesterId: string, dto: UpdateRunnerDto) {
    const r = await this.prisma.runner.findUnique({ where: { id } });
    if (!r) throw new NotFoundException();
    if (r.userId !== requesterId) throw new ForbiddenException();

    return this.prisma.runner.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(id: string, requesterId: string) {
    const r = await this.prisma.runner.findUnique({ where: { id } });
    if (!r) throw new NotFoundException();
    if (r.userId !== requesterId) throw new ForbiddenException();

    await this.prisma.runner.delete({ where: { id } });
    return { ok: true };
  }
}
