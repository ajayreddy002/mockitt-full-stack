import {
  Controller,
  Get,
  Post,
  // Patch,
  Param,
  Body,
  // Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QuizzesService } from './quizzes.service';
import { SubmitQuizResponsesDto } from './dto';

@Controller('quizzes')
@UseGuards(JwtAuthGuard)
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get(':id')
  async getQuizById(@Param('id', ParseUUIDPipe) quizId: string) {
    return this.quizzesService.getQuizById(quizId);
  }

  @Get(':id/attempts')
  async getQuizAttempts(
    @Param('id', ParseUUIDPipe) quizId: string,
    @Request() req,
  ) {
    return this.quizzesService.getUserAttempts(req.user.id, quizId);
  }

  @Post(':id/attempts')
  async startQuizAttempt(
    @Param('id', ParseUUIDPipe) quizId: string,
    @Request() req,
    // @Body() startAttemptDto: StartQuizAttemptDto,
  ) {
    return this.quizzesService.startAttempt(req.user.id, quizId);
  }

  @Post('attempts/:attemptId/submit')
  async submitQuizAttempt(
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @Body() submitDto: SubmitQuizResponsesDto,
  ) {
    return this.quizzesService.submitAttempt(attemptId, submitDto.responses);
  }

  @Get('attempts/:attemptId/results')
  async getQuizResults(@Param('attemptId', ParseUUIDPipe) attemptId: string) {
    return this.quizzesService.getAttemptResults(attemptId);
  }
}
