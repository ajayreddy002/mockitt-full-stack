import { IsBoolean, IsOptional } from 'class-validator';

export class EnrollmentDto {
  @IsBoolean()
  @IsOptional()
  isPremium?: boolean;
}
