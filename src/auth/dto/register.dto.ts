import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
} from 'class-validator';

export enum UserCategory {
  RUNNER = 'RUNNER',
  CYCLIST = 'CYCLIST',
  WALKER = 'WALKER',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(50)
  displayName!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  password!: string;

  @ApiProperty({ enum: UserCategory, default: UserCategory.RUNNER })
  @IsEnum(UserCategory)
  @IsOptional()
  category?: UserCategory;

  @ApiProperty({ enum: UserRole, default: UserRole.USER })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
