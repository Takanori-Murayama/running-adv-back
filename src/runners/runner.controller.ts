import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Req,
  Delete,
} from '@nestjs/common';
import { RunnerService } from './runner.service';
import { CreateRunnerDto } from './dto/create-runner.dto';
import { UpdateRunnerDto } from './dto/update-runner.dto';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import type { Request } from 'express';

@Controller('runners')
export class RunnerController {
  constructor(private readonly runnerService: RunnerService) {}

  // 公開一覧
  @Get()
  list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('area') area?: string,
    @Query('q') q?: string,
  ) {
    return this.runnerService.findPublicList({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      area,
      q,
    });
  }

  // 詳細（公開 or 本人）
  @Get(':id')
  detail(@Param('id') id: string, @Req() req: Request) {
    const requesterId = (req.user as any)?.id;
    return this.runnerService.findOnePublicOrOwned(id, requesterId);
  }

  // 作成（本人）
  @UseGuards(AuthenticatedGuard)
  @Post()
  create(@Req() req: Request, @Body() dto: CreateRunnerDto) {
    const userId = (req.user as any).id;
    return this.runnerService.create(userId, dto);
  }

  // 更新（本人）
  @UseGuards(AuthenticatedGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() dto: UpdateRunnerDto,
  ) {
    const userId = (req.user as any).id;
    return this.runnerService.update(id, userId, dto);
  }

  // 削除（本人）
  @UseGuards(AuthenticatedGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.runnerService.remove(id, userId);
  }
}
