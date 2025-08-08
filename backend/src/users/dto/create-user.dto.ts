import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password (minimum 8 characters)',
    minLength: 8,
    maxLength: 50,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(50, { message: 'Password must not exceed 50 characters' })
  password: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
    minLength: 2,
    maxLength: 30,
  })
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(30, { message: 'First name must not exceed 30 characters' })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
    minLength: 2,
    maxLength: 30,
  })
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(30, { message: 'Last name must not exceed 30 characters' })
  lastName: string;

  @ApiPropertyOptional({
    enum: UserRole,
    example: UserRole.STUDENT,
    description: 'User role (defaults to STUDENT)',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole = UserRole.STUDENT;
}
