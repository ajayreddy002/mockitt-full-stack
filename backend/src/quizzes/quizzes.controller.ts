// src/quizzes/quizzes.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QuizzesService } from './quizzes.service';
import { SubmitQuizResponsesDto, SubmitAnswerDto } from './dto';

@ApiTags('quizzes')
@Controller('quizzes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  // ✅ Get quizzes for a specific module (from courses controller)
  @Get('modules/:moduleId')
  @ApiOperation({ summary: 'Get all quizzes for a module' })
  @ApiParam({ name: 'moduleId', description: 'Module UUID' })
  @ApiResponse({
    status: 200,
    description: 'Module quizzes retrieved successfully',
  })
  async getModuleQuizzes(
    @Param('moduleId', ParseUUIDPipe) moduleId: string,
    @Request() req,
  ) {
    return this.quizzesService.getModuleQuizzes(moduleId, req.user.id);
  }

  // ✅ Get quiz by ID (from standalone controller)
  @Get(':id')
  @ApiOperation({ summary: 'Get quiz details by ID' })
  @ApiParam({ name: 'id', description: 'Quiz UUID' })
  @ApiResponse({
    status: 200,
    description: 'Quiz details retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async getQuizById(
    @Param('id', ParseUUIDPipe) quizId: string,
    @Request() req,
  ) {
    return this.quizzesService.getQuizById(quizId, req.user.id);
  }

  // ✅ Get user's attempts for a quiz (from standalone controller)
  @Get(':id/attempts')
  @ApiOperation({ summary: 'Get user attempts for a quiz' })
  @ApiParam({ name: 'id', description: 'Quiz UUID' })
  @ApiResponse({
    status: 200,
    description: 'User attempts retrieved successfully',
  })
  async getUserAttempts(
    @Param('id', ParseUUIDPipe) quizId: string,
    @Request() req,
  ) {
    return this.quizzesService.getUserAttempts(req.user.id, quizId);
  }

  // ✅ Start new quiz attempt (consolidated from both controllers)
  @Post(':id/attempts')
  @ApiOperation({ summary: 'Start a new quiz attempt' })
  @ApiParam({ name: 'id', description: 'Quiz UUID' })
  @ApiResponse({
    status: 201,
    description: 'Quiz attempt started successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Maximum attempts reached or not enrolled',
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async startAttempt(
    @Param('id', ParseUUIDPipe) quizId: string,
    @Request() req,
  ) {
    return this.quizzesService.startAttempt(req.user.id, quizId);
  }

  // ✅ Submit answer for individual question (from courses controller)
  @Patch('attempts/:attemptId/questions/:questionId')
  @ApiOperation({ summary: 'Submit answer for a specific question' })
  @ApiParam({ name: 'attemptId', description: 'Quiz attempt UUID' })
  @ApiParam({ name: 'questionId', description: 'Question UUID' })
  @ApiResponse({ status: 200, description: 'Answer submitted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Quiz already completed or invalid answer',
  })
  @ApiResponse({ status: 404, description: 'Attempt or question not found' })
  async submitAnswer(
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Body() answerDto: SubmitAnswerDto,
    // @Request() req,
  ) {
    return this.quizzesService.answerQuestion(
      attemptId,
      questionId,
      answerDto.answer,
      answerDto.timeSpent,
    );
  }

  // ✅ Submit entire quiz attempt (from standalone controller - bulk submission)
  @Post('attempts/:attemptId/submit')
  @ApiOperation({ summary: 'Submit entire quiz attempt with all answers' })
  @ApiParam({ name: 'attemptId', description: 'Quiz attempt UUID' })
  @ApiResponse({ status: 200, description: 'Quiz submitted successfully' })
  @ApiResponse({ status: 400, description: 'Quiz already completed' })
  @ApiResponse({ status: 404, description: 'Attempt not found' })
  @HttpCode(HttpStatus.OK)
  async submitBulkAttempt(
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @Body() submitDto: SubmitQuizResponsesDto,
  ) {
    return this.quizzesService.submitAttempt(attemptId, submitDto.responses);
  }

  // ✅ Finish quiz attempt (from courses controller - finalize without bulk answers)
  @Post('attempts/:attemptId/finish')
  @ApiOperation({ summary: 'Finish quiz attempt and calculate results' })
  @ApiParam({ name: 'attemptId', description: 'Quiz attempt UUID' })
  @ApiResponse({ status: 200, description: 'Quiz completed successfully' })
  @ApiResponse({ status: 400, description: 'Quiz already completed' })
  @ApiResponse({ status: 404, description: 'Attempt not found' })
  @HttpCode(HttpStatus.OK)
  async finishAttempt(@Param('attemptId', ParseUUIDPipe) attemptId: string) {
    return this.quizzesService.finishAttempt(attemptId);
  }

  // ✅ Get quiz results (from standalone controller)
  @Get('attempts/:attemptId/results')
  @ApiOperation({ summary: 'Get detailed results for a completed attempt' })
  @ApiParam({ name: 'attemptId', description: 'Quiz attempt UUID' })
  @ApiResponse({ status: 200, description: 'Results retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Attempt not found' })
  @ApiResponse({ status: 400, description: 'Quiz not yet completed' })
  async getAttemptResults(
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @Request() req,
  ) {
    return this.quizzesService.getAttemptResults(attemptId, req.user.id);
  }

  // ✅ Get user quiz history
  @Get('history')
  @ApiOperation({ summary: 'Get user quiz attempt history' })
  @ApiQuery({
    name: 'quizId',
    description: 'Filter by quiz ID',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Quiz history retrieved successfully',
  })
  async getQuizHistory(@Request() req, @Query('quizId') quizId?: string) {
    return this.quizzesService.getUserQuizHistory(req.user.id, quizId);
  }
}
