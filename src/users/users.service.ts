import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListUsersQueryDto } from './dto/list-users.query';
import type { User, UserRole, UserCategory } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PublicUser } from './types/public-user.type';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: ListUsersQueryDto): Promise<PublicUser[]> {
    const where: {
      role?: UserRole;
      category?: UserCategory;
    } = {};

    // roleでフィルタリング
    if (query?.role) {
      where.role = query.role;
    }

    // categoryでフィルタリング
    if (query?.category) {
      where.category = query.category;
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        displayName: true,
        photoUrl: true,
        role: true,
        category: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // パスワードハッシュや認証情報は除外
        provider: false,
        providerId: false,
        passwordHash: false,
      },
    });
  }

  async findOne(id: string): Promise<PublicUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        displayName: true,
        photoUrl: true,
        role: true,
        category: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // パスワードハッシュや認証情報は除外
        provider: false,
        providerId: false,
        passwordHash: false,
      },
    });
  }

  async updateProfile(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<PublicUser> {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        displayName: true,
        photoUrl: true,
        role: true,
        category: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // パスワードハッシュや認証情報は除外
        provider: false,
        providerId: false,
        passwordHash: false,
      },
    });
  }

  async remove(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    // DBのUserテーブルから email でユーザーを探す
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    return { ...user };
  }
}
