import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InstantCoachingDto {
  @ApiProperty({ description: 'Current response being given' })
  @IsString()
  @IsNotEmpty()
  currentResponse: string;

  @ApiProperty({ description: 'Context information', required: false })
  @IsOptional()
  @IsObject()
  context?: {
    targetRole?: string;
    industry?: string;
    currentQuestion?: string;
  };
}
