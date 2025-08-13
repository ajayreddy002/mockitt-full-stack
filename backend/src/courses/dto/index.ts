import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { CourseCategory, CourseLevel } from '@prisma/client';
import { Transform } from 'class-transformer';

export class CourseFiltersDto {
  @IsOptional()
  @IsEnum(CourseCategory)
  category?: CourseCategory;

  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isPremium?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class EnrollmentDto {
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  couponCode?: string;
}

export class UpdateProgressDto {
  @IsBoolean()
  isCompleted: boolean;

  @IsOptional()
  @IsNumber()
  timeSpent?: number;
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
