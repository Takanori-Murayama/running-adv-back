import { ApiProperty } from '@nestjs/swagger';

export enum UserCategory {
  RUNNER = 'RUNNER',
  CYCLIST = 'CYCLIST',
  WALKER = 'WALKER',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export class UserDto {
  @ApiProperty() id!: string;
  @ApiProperty() email!: string;
  @ApiProperty({ required: false }) displayName?: string;
  @ApiProperty({ required: false }) photoUrl?: string;
  @ApiProperty({ enum: UserCategory }) category!: UserCategory;
  @ApiProperty({ enum: UserRole }) role!: UserRole;
}
