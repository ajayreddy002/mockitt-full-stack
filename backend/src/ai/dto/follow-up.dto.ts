import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FollowUpDto {
  @ApiProperty({ description: 'Original interview question' })
  @IsString()
  @IsNotEmpty()
  originalQuestion: string;

  @ApiProperty({ description: 'User response to the original question' })
  @IsString()
  @IsNotEmpty()
  userResponse: string;

  @ApiProperty({ description: 'Additional context', required: false })
  @IsOptional()
  @IsObject()
  context?: {
    targetRole?: string;
    industry?: string;
  };
}
