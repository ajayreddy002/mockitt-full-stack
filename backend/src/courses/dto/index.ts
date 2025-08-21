import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { CourseCategory, CourseLevel } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CourseFiltersDto {
  @ApiPropertyOptional({
    enum: CourseCategory,
    description: 'Filter by course category',
  })
  @IsOptional()
  @IsEnum(CourseCategory)
  category?: CourseCategory;

  @ApiPropertyOptional({
    enum: CourseLevel,
    description: 'Filter by course level',
  })
  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @ApiPropertyOptional({ description: 'Filter by premium status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isPremium?: boolean;

  @ApiPropertyOptional({ description: 'Search in title and description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    minimum: 1,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
export class EnrollmentDto {
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  couponCode?: string;
}

export class LessonProgressDto {
  @ApiProperty({ description: 'Whether the lesson is completed' })
  @IsBoolean()
  isCompleted: boolean;

  @ApiPropertyOptional({ description: 'Time spent on lesson in seconds' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  timeSpent?: number;

  @ApiPropertyOptional({ description: 'Progress percentage (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  progressPercentage?: number;
}

export class CreateCourseDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsEnum(CourseLevel)
  level: CourseLevel;

  @IsEnum(CourseCategory)
  category: CourseCategory;

  @IsNumber()
  estimatedHours: number;

  @IsNumber()
  price: number;

  @IsBoolean()
  isPremium: boolean;
}
