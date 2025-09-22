import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateRunnerDto {
  @ApiProperty()
  @IsString()
  @MaxLength(50)
  displayName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  area?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(120)
  paceSec?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

// Update は PartialType でOK
import { PartialType } from '@nestjs/swagger';
export class UpdateRunnerDto extends PartialType(CreateRunnerDto) {}
