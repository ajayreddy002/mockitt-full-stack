import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RealTimeAnalysisDto {
  @ApiProperty({ description: 'The spoken text to analyze' })
  @IsString()
  @IsNotEmpty()
  spokenText: string;

  @ApiProperty({ description: 'The interview question being answered' })
  @IsString()
  @IsNotEmpty()
  currentQuestion: string;

  @ApiProperty({ description: 'Target job role' })
  @IsString()
  @IsNotEmpty()
  targetRole: string;

  @ApiProperty({ description: 'Target industry' })
  @IsString()
  @IsNotEmpty()
  industry: string;

  @ApiProperty({ description: 'Additional context', required: false })
  @IsOptional()
  @IsObject()
  context?: any;
}
