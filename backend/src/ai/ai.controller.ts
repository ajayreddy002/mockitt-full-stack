import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AiService } from './ai.service';
import {
  RealTimeAnalysisDto,
  InstantCoachingDto,
  FollowUpDto,
  QuestionGenerationDto,
  SpeechAnalysisDto,
} from './dto';

@ApiTags('AI Services')
@Controller('ai')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiService: AiService) {}

  @Post('analyze/real-time')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Analyze interview response in real-time' })
  @ApiResponse({ status: 200, description: 'Analysis completed successfully' })
  async analyzeRealTime(@Body() analysisData: RealTimeAnalysisDto) {
    this.logger.log(
      `Real-time analysis requested for role: ${analysisData.targetRole}`,
    );
    return this.aiService.analyzeResponseRealTime(analysisData);
  }

  @Post('coaching/instant-tips')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate instant coaching tips' })
  @ApiResponse({
    status: 200,
    description: 'Coaching tips generated successfully',
  })
  async getInstantTips(@Body() coachingData: InstantCoachingDto) {
    this.logger.log(`Coaching tips requested`);
    return this.aiService.generateInstantCoachingTips(coachingData);
  }

  @Post('questions/generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate personalized interview questions' })
  @ApiResponse({ status: 200, description: 'Questions generated successfully' })
  async generateQuestions(@Body() questionData: QuestionGenerationDto) {
    this.logger.log(
      `Question generation requested for ${questionData.targetRole}`,
    );
    return this.aiService.generatePersonalizedQuestions(questionData);
  }

  @Post('questions/follow-up')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate smart follow-up question' })
  @ApiResponse({
    status: 200,
    description: 'Follow-up question generated successfully',
  })
  async generateFollowUp(@Body() followUpData: FollowUpDto) {
    this.logger.log(`Follow-up question requested`);
    return this.aiService.generateSmartFollowUp(followUpData);
  }

  @Post('speech/analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Analyze speech patterns' })
  @ApiResponse({
    status: 200,
    description: 'Speech analysis completed successfully',
  })
  async analyzeSpeech(@Body() speechData: SpeechAnalysisDto) {
    this.logger.log(`Speech analysis requested`);
    return this.aiService.analyzeSpeechPatterns(speechData);
  }
}
