import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserCategory } from '@prisma/client';

export class ListUsersQueryDto {
  @ApiPropertyOptional({
    enum: UserRole,
    description: 'ユーザーの役割でフィルタリング（ADMIN | USER）',
    example: 'USER',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    enum: UserCategory,
    description:
      'ユーザーのカテゴリでフィルタリング（RUNNER | CYCLIST | WALKER）',
    example: 'RUNNER',
  })
  @IsOptional()
  @IsEnum(UserCategory)
  category?: UserCategory;
}
