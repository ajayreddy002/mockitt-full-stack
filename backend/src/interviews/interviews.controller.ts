// istanbul ignore file
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  BadRequestException,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { InterviewsService } from './interviews.service';
import { GetUser } from '../auth/get-user.decorator';
import { User, InterviewType } from '@prisma/client';
import { PredictiveAnalyticsService } from '../analytics/predictive-analytics.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Interviews')
@Controller('interviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class InterviewsController {
  constructor(
    private interviewsService: InterviewsService,
    private predictiveAnalyticsService: PredictiveAnalyticsService,
  ) {}

  @Post('sessions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new interview session' })
  @ApiResponse({
    status: 201,
    description: 'Interview session created successfully',
  })
  async createSession(
    @Body(ValidationPipe)
    createSessionDto: {
      title: string;
      type: InterviewType;
      settings: {
        recordVideo: boolean;
        recordAudio: boolean;
        enableHints: boolean;
        timePerQuestion: number;
        industry: string;
        role: string;
      };
    },
    @GetUser() user: User,
  ) {
    return this.interviewsService.createSession(createSessionDto, user);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get user interview sessions' })
  async getSessions(
    @GetUser() user: User,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const skipNumber = skip ? parseInt(skip, 10) : 0;
    const takeNumber = take ? parseInt(take, 10) : 20;

    return this.interviewsService.getUserSessions(user, skipNumber, takeNumber);
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Get specific interview session' })
  async getSession(@Param('id') sessionId: string) {
    return this.interviewsService.getSessionById(sessionId);
  }

  @Put('sessions/:id')
  @ApiOperation({ summary: 'Update interview session' })
  async updateSession(
    @Param('id') sessionId: string,
    @Body(ValidationPipe)
    updateData: {
      title?: string;
      currentQuestionIndex?: number;
      settings?: any;
    },
  ) {
    return this.interviewsService.updateSession(sessionId, updateData);
  }

  @Post('sessions/:id/start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start interview session' })
  async startSession(@Param('id') sessionId: string) {
    return this.interviewsService.startSession(sessionId);
  }

  @Post('sessions/:id/end')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'End interview session' })
  async endSession(@Param('id') sessionId: string) {
    return this.interviewsService.endSession(sessionId);
  }

  @Delete('sessions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete interview session' })
  async deleteSession(@Param('id') sessionId: string) {
    return this.interviewsService.deleteSession(sessionId);
  }

  @Post('responses')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Save interview response' })
  async saveResponse(
    @Body(ValidationPipe)
    responseDto: {
      sessionId: string;
      questionId: string;
      question: string;
      transcription?: string;
      audioUrl?: string;
      videoUrl?: string;
      duration: number;
    },
  ) {
    return this.interviewsService.saveResponse(responseDto);
  }

  @Get('sessions/:id/responses')
  @ApiOperation({ summary: 'Get session responses' })
  async getSessionResponses(@Param('id') sessionId: string) {
    const session = await this.interviewsService.getSessionById(sessionId);
    return session.responses;
  }

  @Get('sessions/:id/results')
  @ApiOperation({ summary: 'Get comprehensive session results' })
  async getSessionResults(@Param('id') sessionId: string) {
    return this.interviewsService.generateSessionResults(sessionId);
  }
  @Post('sessions/:id/responses/batch')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit multiple interview responses in batch' })
  @ApiResponse({
    status: 201,
    description: 'Batch responses submitted successfully',
  })
  async submitBatchResponses(
    @Param('id') sessionId: string,
    @Body(ValidationPipe)
    batchData: {
      responses: Array<{
        questionId: string;
        question: string;
        transcription?: string;
        audioUrl?: string;
        videoUrl?: string;
        duration: number;
      }>;
    },
  ) {
    return this.interviewsService.submitBatchResponses(
      sessionId,
      batchData.responses,
    );
  }
  @Get('analytics/predictive')
  @ApiOperation({ summary: 'Get predictive analytics for user' })
  @ApiResponse({
    status: 200,
    description: 'Predictive insights generated successfully',
  })
  async getPredictiveAnalytics(@Request() req) {
    console.log(req, 'user:', req.user);
    try {
      const insights =
        await this.predictiveAnalyticsService.generatePredictiveInsights(
          req.user.id,
        );

      return {
        success: true,
        insights,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to generate predictive analytics:', error);
      throw new BadRequestException('Failed to generate analytics');
    }
  }

  // ✅ NEW: Trend analysis endpoint
  @Get('analytics/trends')
  @ApiOperation({ summary: 'Get detailed trend analysis' })
  async getTrendAnalysis(@Request() req) {
    try {
      const insights =
        await this.predictiveAnalyticsService.generatePredictiveInsights(
          req.user.id,
        );

      return {
        success: true,
        trends: insights.trends,
        recommendations: insights.recommendations,
      };
    } catch (error) {
      console.error('Failed to get trend analysis:', error);
      throw new BadRequestException('Failed to get trend analysis');
    }
  }
}
