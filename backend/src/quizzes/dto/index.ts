import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitAnswerDto {
  @ApiProperty({ description: 'User answer' })
  @IsNotEmpty()
  answer: any;

  @ApiPropertyOptional({ description: 'Time spent on question in seconds' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  timeSpent?: number;
}

export class QuizResponseDto {
  @ApiProperty({ description: 'Question ID' })
  @IsUUID()
  questionId: string;

  @ApiProperty({ description: 'User answer' })
  @IsNotEmpty()
  answer: any;

  @ApiPropertyOptional({ description: 'Time spent on question in seconds' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  timeSpent?: number;
}

export class SubmitQuizResponsesDto {
  @ApiProperty({
    type: [QuizResponseDto],
    description: 'Array of quiz responses',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizResponseDto)
  responses: QuizResponseDto[];
}

export class QuizFiltersDto {
  @ApiPropertyOptional({ description: 'Search by title' })
  @IsOptional()
  @IsString()
  search?: string;
}
