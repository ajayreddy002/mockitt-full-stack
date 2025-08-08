import { IsString, IsNotEmpty, IsArray, IsNumber, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QuestionGenerationDto {
  @ApiProperty({ description: 'Target job role' })
  @IsString()
  @IsNotEmpty()
  targetRole: string;

  @ApiProperty({ description: 'Target industry' })
  @IsString()
  @IsNotEmpty()
  targetIndustry: string;

  @ApiProperty({ description: 'Question difficulty level' })
  @IsString()
  @IsIn(['easy', 'medium', 'hard'])
  difficulty: 'easy' | 'medium' | 'hard';

  @ApiProperty({ description: 'Types of questions to generate' })
  @IsArray()
  questionTypes: (
    | 'behavioral'
    | 'technical'
    | 'situational'
    | 'company-specific'
  )[];

  @ApiProperty({ description: 'Number of questions to generate' })
  @IsNumber()
  count: number;
}
