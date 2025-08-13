import { IsArray, IsString, IsNotEmpty } from 'class-validator';

export class StartQuizAttemptDto {
  // No additional data needed for starting attempt
}

export class QuizResponseDto {
  @IsString()
  @IsNotEmpty()
  questionId: string;

  // Answer can be string, boolean, or array depending on question type
  answer: any;
}

export class SubmitQuizResponsesDto {
  @IsArray()
  responses: QuizResponseDto[];
}
