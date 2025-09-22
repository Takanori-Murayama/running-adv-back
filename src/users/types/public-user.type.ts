import type { User, UserRole, UserCategory } from '@prisma/client';

// 公開用のユーザー型（機密情報を除外）
export type PublicUser = Pick<
  User,
  | 'id'
  | 'email'
  | 'displayName'
  | 'photoUrl'
  | 'role'
  | 'category'
  | 'isActive'
  | 'createdAt'
  | 'updatedAt'
>;

export { UserRole, UserCategory };
