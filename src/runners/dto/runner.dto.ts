// src/runners/dto/runner.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class RunnerDto {
  @ApiProperty() id!: string;
  @ApiProperty() displayName!: string;
  @ApiProperty({ required: false }) bio?: string;
  @ApiProperty({ required: false }) area?: string;
  @ApiProperty({ required: false }) paceSec?: number;
  @ApiProperty({ type: [String] }) tags!: string[];
  @ApiProperty({ required: false }) avatarUrl?: string;
  @ApiProperty() isPublic!: boolean;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}
