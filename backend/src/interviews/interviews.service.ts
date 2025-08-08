import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import {
  InterviewSession,
  InterviewResponse,
  InterviewType,
  InterviewStatus,
  User,
} from '@prisma/client';

@Injectable()
export class InterviewsService {
  private readonly logger = new Logger(InterviewsService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  // Create new interview session
  async createSession(
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
    user: User,
  ): Promise<InterviewSession> {
    try {
      this.logger.log(`Creating interview session for user ${user.id}`);

      // Generate AI questions for the session
      const questionsResult =
        await this.aiService.generatePersonalizedQuestions({
          targetRole: createSessionDto.settings.role,
          targetIndustry: createSessionDto.settings.industry,
          difficulty: 'medium',
          questionTypes: ['behavioral', 'technical', 'situational'],
          count: this.getQuestionCount(createSessionDto.type),
        });

      const session = await this.prisma.interviewSession.create({
        data: {
          title: createSessionDto.title,
          type: createSessionDto.type,
          status: InterviewStatus.SCHEDULED,
          questions: questionsResult.questions,
          settings: createSessionDto.settings,
          userId: user.id,
        },
      });

      this.logger.log(`Created interview session ${session.id}`);
      return session;
    } catch (error) {
      this.logger.error(`Failed to create session: ${error.message}`);
      throw new BadRequestException('Failed to create interview session');
    }
  }

  // Get all sessions for a user
  async getUserSessions(
    user: User,
    skip = 0,
    take = 20,
  ): Promise<{
    sessions: InterviewSession[];
    total: number;
  }> {
    try {
      const [sessions, total] = await Promise.all([
        this.prisma.interviewSession.findMany({
          where: { userId: user.id },
          include: {
            responses: {
              select: {
                id: true,
                score: true,
                duration: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
        this.prisma.interviewSession.count({
          where: { userId: user.id },
        }),
      ]);

      return { sessions, total };
    } catch (error) {
      this.logger.error(`Failed to fetch user sessions: ${error.message}`);
      throw new BadRequestException('Failed to fetch interview sessions');
    }
  }

  // Get specific session by ID
  async getSessionById(sessionId: string): Promise<
    InterviewSession & {
      responses: InterviewResponse[];
    }
  > {
    try {
      const session = await this.prisma.interviewSession.findUnique({
        where: { id: sessionId },
        include: {
          responses: true,
        },
      });

      if (!session) {
        throw new NotFoundException('Interview session not found');
      }

      return session;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to fetch session ${sessionId}: ${error.message}`,
      );
      throw new BadRequestException('Failed to fetch interview session');
    }
  }

  // Start an interview session
  async startSession(sessionId: string): Promise<InterviewSession> {
    try {
      const session = await this.prisma.interviewSession.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        throw new NotFoundException('Interview session not found');
      }

      if (session.status !== InterviewStatus.SCHEDULED) {
        throw new BadRequestException(
          'Session cannot be started in current state',
        );
      }

      const updatedSession = await this.prisma.interviewSession.update({
        where: { id: sessionId },
        data: {
          status: InterviewStatus.IN_PROGRESS,
          startTime: new Date(),
        },
      });

      this.logger.log(`Started interview session ${sessionId}`);
      return updatedSession;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to start session ${sessionId}: ${error.message}`,
      );
      throw new BadRequestException('Failed to start interview session');
    }
  }

  // End an interview session
  async endSession(sessionId: string): Promise<InterviewSession> {
    try {
      const session = await this.prisma.interviewSession.findUnique({
        where: { id: sessionId },
        include: { responses: true },
      });

      if (!session) {
        throw new NotFoundException('Interview session not found');
      }

      if (session.status !== InterviewStatus.IN_PROGRESS) {
        throw new BadRequestException('Session is not in progress');
      }

      const endTime = new Date();
      const totalDuration = session.startTime
        ? Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000)
        : 0;

      // Calculate overall score
      const overallScore = this.calculateOverallScore(session.responses);

      const updatedSession = await this.prisma.interviewSession.update({
        where: { id: sessionId },
        data: {
          status: InterviewStatus.COMPLETED,
          endTime,
          totalDuration,
          overallScore,
        },
      });

      this.logger.log(
        `Ended interview session ${sessionId} with score ${overallScore}`,
      );
      return updatedSession;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Failed to end session ${sessionId}: ${error.message}`);
      throw new BadRequestException('Failed to end interview session');
    }
  }

  // Save interview response
  async saveResponse(responseDto: {
    sessionId: string;
    questionId: string;
    question: string;
    transcription?: string;
    audioUrl?: string;
    videoUrl?: string;
    duration: number;
  }): Promise<InterviewResponse> {
    try {
      // Get session to validate and get settings
      const session = await this.prisma.interviewSession.findUnique({
        where: { id: responseDto.sessionId },
      });

      if (!session) {
        throw new NotFoundException('Interview session not found');
      }

      // Get AI analysis if transcription is provided
      let analysis = null;
      let score = null;

      if (responseDto.transcription) {
        const aiAnalysis = await this.aiService.analyzeResponseRealTime({
          spokenText: responseDto.transcription,
          currentQuestion: responseDto.question,
          targetRole: (session.settings as any).role || 'General',
          industry: (session.settings as any).industry || 'Technology',
        });

        analysis = aiAnalysis.data;
        score = aiAnalysis.data?.confidence || null;
      }

      const response = await this.prisma.interviewResponse.create({
        data: {
          sessionId: responseDto.sessionId,
          questionId: responseDto.questionId,
          question: responseDto.question,
          transcription: responseDto.transcription,
          audioUrl: responseDto.audioUrl,
          videoUrl: responseDto.videoUrl,
          duration: responseDto.duration,
          score,
          analysis,
        },
      });

      this.logger.log(
        `Saved response for session ${responseDto.sessionId}, question ${responseDto.questionId}`,
      );
      return response;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to save response: ${error.message}`);
      throw new BadRequestException('Failed to save interview response');
    }
  }

  // Generate comprehensive session results
  async generateSessionResults(sessionId: string): Promise<{
    sessionId: string;
    title: string;
    completedAt: Date | null;
    totalDuration: number;
    overallScore: number;
    questionsCompleted: number;
    totalQuestions: number;
    questionResults: Array<{
      questionId: string;
      question: string;
      duration: number;
      score: number;
      analysis: any;
    }>;
    insights: {
      topStrengths: string[];
      keyImprovements: string[];
      nextSteps: string[];
    };
  }> {
    try {
      const session = await this.prisma.interviewSession.findUnique({
        where: { id: sessionId },
        include: {
          responses: true,
        },
      });

      if (!session) {
        throw new NotFoundException('Interview session not found');
      }

      const questionResults = session.responses.map((response) => ({
        questionId: response.questionId,
        question: response.question,
        duration: response.duration,
        score: response.score || 0,
        analysis: response.analysis || {},
      }));

      const insights = this.generateInsights(session.responses);

      return {
        sessionId: session.id,
        title: session.title,
        completedAt: session.endTime,
        totalDuration: session.totalDuration,
        overallScore: session.overallScore || 0,
        questionsCompleted: session.responses.length,
        totalQuestions: Array.isArray(session.questions)
          ? (session.questions as any[]).length
          : 0,
        questionResults,
        insights,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to generate results for session ${sessionId}: ${error.message}`,
      );
      throw new BadRequestException('Failed to generate session results');
    }
  }

  // Update session settings
  async updateSession(
    sessionId: string,
    updateData: {
      title?: string;
      currentQuestionIndex?: number;
      settings?: any;
    },
  ): Promise<InterviewSession> {
    try {
      const session = await this.prisma.interviewSession.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        throw new NotFoundException('Interview session not found');
      }

      const updatedSession = await this.prisma.interviewSession.update({
        where: { id: sessionId },
        data: updateData,
      });

      return updatedSession;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to update session ${sessionId}: ${error.message}`,
      );
      throw new BadRequestException('Failed to update interview session');
    }
  }

  // Delete session
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const session = await this.prisma.interviewSession.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        throw new NotFoundException('Interview session not found');
      }

      await this.prisma.interviewSession.delete({
        where: { id: sessionId },
      });

      this.logger.log(`Deleted interview session ${sessionId}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to delete session ${sessionId}: ${error.message}`,
      );
      throw new BadRequestException('Failed to delete interview session');
    }
  }

  // Private helper methods
  private getQuestionCount(type: InterviewType): number {
    switch (type) {
      case InterviewType.QUICK_PREP:
        return 3;
      case InterviewType.PRACTICE:
        return 5;
      case InterviewType.FULL_MOCK:
        return 10;
      default:
        return 5;
    }
  }

  private calculateOverallScore(responses: InterviewResponse[]): number {
    if (responses.length === 0) return 0;

    const validScores = responses
      .filter((response) => response.score !== null)
      .map((response) => response.score as number);

    if (validScores.length === 0) return 0;

    const average =
      validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
    return Math.round(average * 100) / 100; // Round to 2 decimal places
  }

  private generateInsights(responses: InterviewResponse[]): {
    topStrengths: string[];
    keyImprovements: string[];
    nextSteps: string[];
  } {
    // Extract insights from AI analysis
    const allStrengths: string[] = [];
    const allImprovements: string[] = [];

    responses.forEach((response) => {
      if (response.analysis) {
        const analysis = response.analysis as any;
        if (analysis.strengths) {
          allStrengths.push(...analysis.strengths);
        }
        if (analysis.improvementAreas) {
          allImprovements.push(...analysis.improvementAreas);
        }
      }
    });

    // Get unique strengths and improvements (you could implement more sophisticated logic)
    const topStrengths = [...new Set(allStrengths)].slice(0, 5);
    const keyImprovements = [...new Set(allImprovements)].slice(0, 5);

    const nextSteps = [
      'Practice behavioral questions with specific examples',
      'Research company background for targeted practice',
      'Work on speaking pace and clarity',
      'Focus on quantifiable achievements',
      'Practice with industry-specific terminology',
    ];

    return {
      topStrengths:
        topStrengths.length > 0
          ? topStrengths
          : ['Clear communication', 'Professional presentation'],
      keyImprovements:
        keyImprovements.length > 0
          ? keyImprovements
          : ['Add more specific examples', 'Improve time management'],
      nextSteps,
    };
  }
}
