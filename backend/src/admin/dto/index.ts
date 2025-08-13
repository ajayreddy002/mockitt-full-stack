// backend/src/admin/dto/index.ts
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CourseCategory, CourseLevel, UserRole } from '@prisma/client';

export class CreateCourseDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsEnum(CourseCategory)
  category: CourseCategory;

  @IsEnum(CourseLevel)
  level: CourseLevel;

  @IsNumber()
  estimatedHours: number;

  @IsNumber()
  price: number;

  @IsBoolean()
  isPremium: boolean;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateModuleDto)
  modules?: CreateModuleDto[];
}

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsEnum(CourseCategory)
  category?: CourseCategory;

  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @IsOptional()
  @IsNumber()
  estimatedHours?: number;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class CreateModuleDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @IsOptional() // ✅ Allow orderIndex
  orderIndex?: number;

  @IsBoolean()
  isRequired: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLessonDto)
  lessons?: CreateLessonDto[];
}

export class CreateLessonDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsEnum(['TEXT', 'VIDEO', 'AUDIO', 'PDF', 'INTERACTIVE'])
  contentType: string;

  @IsOptional()
  @IsString()
  contentUrl?: string;

  @IsNumber()
  duration: number;

  @IsBoolean()
  isRequired: boolean;

  @IsNumber()
  @IsOptional() // ✅ Allow orderIndex
  orderIndex?: number;
}

export class CreateQuizDto {
  @IsString()
  moduleId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['MODULE_ASSESSMENT', 'PRACTICE_QUIZ', 'FINAL_ASSESSMENT'])
  type: string;

  @IsEnum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
  difficulty: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsNumber()
  passingScore: number;

  @IsNumber()
  maxAttempts: number;

  @IsBoolean()
  isRandomized: boolean;

  @IsBoolean()
  showResults: boolean;

  @IsBoolean()
  allowReview: boolean;

  @IsBoolean()
  timeLimit: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions?: CreateQuestionDto[];
}

export class CreateQuestionDto {
  @IsString()
  text: string;

  @IsEnum(['MULTIPLE_CHOICE', 'MULTIPLE_SELECT', 'TRUE_FALSE', 'SHORT_ANSWER'])
  type: string;

  @IsOptional()
  @IsArray()
  options?: string[];

  correctAnswer: any; // Will be validated based on question type

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsNumber()
  points: number;

  @IsEnum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
  difficulty: string;

  @IsOptional()
  @IsArray()
  tags?: string[];
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
