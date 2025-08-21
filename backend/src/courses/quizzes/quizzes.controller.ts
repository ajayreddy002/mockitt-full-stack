import {
  Controller,
  UseGuards,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Patch,
  Body,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QuizzesService } from './quizzes.service';

@Controller('courses/quizzes')
@UseGuards(AuthGuard('jwt'))
export class QuizzesController {
  constructor(private readonly svc: QuizzesService) {}

  @Get(':moduleId')
  getModuleQuizzes(@Param('moduleId', ParseUUIDPipe) moduleId: string) {
    return this.svc.getModuleQuizzes(moduleId);
  }

  @Post(':id/start')
  start(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.svc.startAttempt(req.user.id, id);
  }

  @Patch('attempts/:attemptId/questions/:questionId')
  answer(
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Body('answer') answer: any,
  ) {
    return this.svc.answerQuestion(attemptId, questionId, answer);
  }

  @Post('attempts/:attemptId/submit')
  submit(@Param('attemptId', ParseUUIDPipe) attemptId: string) {
    return this.svc.finishAttempt(attemptId);
  }
}
