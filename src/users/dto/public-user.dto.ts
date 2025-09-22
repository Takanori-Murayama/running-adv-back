import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserCategory } from '@prisma/client';

export class PublicUserDto {
  @ApiProperty({ description: 'ユーザーID' })
  id: string;

  @ApiProperty({ description: 'メールアドレス' })
  email: string;

  @ApiProperty({ description: '表示名' })
  displayName: string;

  @ApiProperty({ description: 'プロフィール画像URL', required: false })
  photoUrl?: string;

  @ApiProperty({
    enum: UserRole,
    description: 'ユーザーの役割（ADMIN | USER）',
  })
  role: UserRole;

  @ApiProperty({
    enum: UserCategory,
    description: 'ユーザーのカテゴリ（RUNNER | CYCLIST | WALKER）',
  })
  category: UserCategory;

  @ApiProperty({ description: 'アクティブかどうか' })
  isActive: boolean;

  @ApiProperty({ description: '作成日時' })
  createdAt: Date;

  @ApiProperty({ description: '更新日時' })
  updatedAt: Date;
}
