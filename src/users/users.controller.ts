import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags, ApiExtraModels } from '@nestjs/swagger';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListUsersQueryDto } from './dto/list-users.query';
import { PublicUserDto } from './dto/public-user.dto';
import { AuthenticatedGuard } from '../auth/authenticated.guard';

@ApiTags('users')
@ApiExtraModels(ListUsersQueryDto, PublicUserDto)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({
    description: '現在ログイン中のユーザー情報を取得',
    type: PublicUserDto,
  })
  getProfile(@Req() req: Request) {
    return req.user;
  }

  @Patch('me')
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({
    description: 'プロフィール更新成功',
    type: PublicUserDto,
  })
  updateProfile(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.usersService.updateProfile(userId, updateUserDto);
  }

  @Get()
  @ApiOkResponse({
    description: 'ユーザー一覧取得（role、categoryでフィルタリング可能）',
    type: [PublicUserDto],
  })
  findAll(@Query() query: ListUsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOkResponse({
    description: '特定ユーザー情報取得',
    type: PublicUserDto,
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'ユーザー削除（将来的に管理者権限必要）' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
