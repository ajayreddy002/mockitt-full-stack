import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SpeechAnalysisDto {
  @ApiProperty({ description: 'Transcription of the speech' })
  @IsString()
  @IsNotEmpty()
  transcription: string;

  @ApiProperty({ description: 'Duration of speech in seconds' })
  @IsNumber()
  duration: number;

  @ApiProperty({ description: 'Audio file URL', required: false })
  @IsOptional()
  @IsString()
  audioUrl?: string;
}
