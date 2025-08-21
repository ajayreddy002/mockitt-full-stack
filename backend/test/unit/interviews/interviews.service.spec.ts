import { Test, TestingModule } from '@nestjs/testing';
import { InterviewsService } from '../../../src/interviews/interviews.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { AiService } from '../../../src/ai/ai.service';
import { NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InterviewType, InterviewStatus, UserRole } from '@prisma/client';

describe('InterviewsService', () => {
  let service: InterviewsService;
  let prismaService: PrismaService;
  let aiService: AiService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.STUDENT,
  };

  const mockSession = {
    id: 'session-123',
    title: 'Frontend Interview',
    type: InterviewType.PRACTICE,
    status: InterviewStatus.SCHEDULED,
    userId: 'user-123',
    questions: [],
    settings: {
      recordVideo: true,
      recordAudio: true,
      enableHints: true,
      timePerQuestion: 120,
      industry: 'Technology',
      role: 'Frontend Developer',
    },
    responses: [],
    startTime: null,
    endTime: null,
    totalDuration: 0,
    overallScore: null,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewsService,
        {
          provide: PrismaService,
          useValue: {
            interviewSession: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            interviewResponse: {
              create: jest.fn(),
              createMany: jest.fn(),
            },
          },
        },
        {
          provide: AiService,
          useValue: {
            generatePersonalizedQuestions: jest.fn(),
            analyzeResponseRealTime: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InterviewsService>(InterviewsService);
    prismaService = module.get<PrismaService>(PrismaService);
    aiService = module.get<AiService>(AiService);
  });

  describe('createSession', () => {
    it('should create interview session with AI questions', async () => {
      const createSessionDto = {
        title: 'Frontend Interview',
        type: InterviewType.PRACTICE,
        settings: {
          recordVideo: true,
          recordAudio: true,
          enableHints: true,
          timePerQuestion: 120,
          industry: 'Technology',
          role: 'Frontend Developer',
        },
      };

      const mockQuestions = {
        questions: [
          { question: 'What is React?', type: 'technical' },
          { question: 'Tell me about yourself', type: 'behavioral' },
        ],
      };

      jest
        .spyOn(aiService, 'generatePersonalizedQuestions')
        .mockResolvedValue(mockQuestions as any);
      jest
        .spyOn(prismaService.interviewSession, 'create')
        .mockResolvedValue(mockSession as any);

      const result = await service.createSession(
        createSessionDto,
        mockUser as any,
      );

      expect(result.id).toBe('session-123');
      expect(aiService.generatePersonalizedQuestions).toHaveBeenCalledWith({
        targetRole: 'Frontend Developer',
        targetIndustry: 'Technology',
        difficulty: 'medium',
        questionTypes: ['behavioral', 'technical', 'situational'],
        count: 5, // PRACTICE type
      });
    });

    it('should handle AI service failure gracefully', async () => {
      const createSessionDto = {
        title: 'Frontend Interview',
        type: InterviewType.PRACTICE,
        settings: {
          recordVideo: true,
          recordAudio: true,
          enableHints: true,
          timePerQuestion: 120,
          industry: 'Technology',
          role: 'Frontend Developer',
        },
      };

      jest
        .spyOn(aiService, 'generatePersonalizedQuestions')
        .mockRejectedValue(new Error('AI service unavailable'));

      await expect(
        service.createSession(createSessionDto, mockUser as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('startSession', () => {
    it('should start a scheduled session', async () => {
      const updatedSession = {
        ...mockSession,
        status: InterviewStatus.IN_PROGRESS,
        startTime: new Date(),
      };

      jest
        .spyOn(prismaService.interviewSession, 'findUnique')
        .mockResolvedValue(mockSession as any);
      jest
        .spyOn(prismaService.interviewSession, 'update')
        .mockResolvedValue(updatedSession as any);

      const result = await service.startSession('session-123');

      expect(result.status).toBe(InterviewStatus.IN_PROGRESS);
      expect(result.startTime).toBeDefined();
    });

    it('should throw NotFoundException for non-existent session', async () => {
      jest
        .spyOn(prismaService.interviewSession, 'findUnique')
        .mockResolvedValue(null);

      await expect(service.startSession('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for session not in scheduled state', async () => {
      const inProgressSession = {
        ...mockSession,
        status: InterviewStatus.IN_PROGRESS,
      };

      jest
        .spyOn(prismaService.interviewSession, 'findUnique')
        .mockResolvedValue(inProgressSession as any);

      await expect(service.startSession('session-123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('saveResponse', () => {
    it('should save interview response with AI analysis', async () => {
      const responseDto = {
        sessionId: 'session-123',
        questionId: 'question-1',
        question: 'What is React?',
        transcription:
          'React is a JavaScript library for building user interfaces',
        audioUrl: 'https://example.com/audio.wav',
        videoUrl: 'https://example.com/video.mp4',
        duration: 120,
      };

      const mockAnalysis = {
        data: {
          confidence: 85,
          clarity: 90,
          keywordRelevance: 80,
        },
      };

      const mockSavedResponse = {
        id: 'response-123',
        ...responseDto,
        score: 85,
        analysis: mockAnalysis.data,
      };

      jest
        .spyOn(prismaService.interviewSession, 'findUnique')
        .mockResolvedValue(mockSession as any);
      jest
        .spyOn(aiService, 'analyzeResponseRealTime')
        .mockResolvedValue(mockAnalysis as any);
      jest
        .spyOn(prismaService.interviewResponse, 'create')
        .mockResolvedValue(mockSavedResponse as any);

      const result = await service.saveResponse(responseDto);

      expect(result.score).toBe(85);
      expect(aiService.analyzeResponseRealTime).toHaveBeenCalledWith({
        spokenText: responseDto.transcription,
        currentQuestion: responseDto.question,
        targetRole: 'Frontend Developer',
        industry: 'Technology',
      });
    });

    it('should save response without AI analysis when no transcription', async () => {
      const responseDto = {
        sessionId: 'session-123',
        questionId: 'question-1',
        question: 'What is React?',
        audioUrl: 'https://example.com/audio.wav',
        duration: 120,
      };

      const mockSavedResponse = {
        id: 'response-123',
        ...responseDto,
        score: null,
        analysis: null,
      };

      jest
        .spyOn(prismaService.interviewSession, 'findUnique')
        .mockResolvedValue(mockSession as any);
      jest
        .spyOn(prismaService.interviewResponse, 'create')
        .mockResolvedValue(mockSavedResponse as any);

      const result = await service.saveResponse(responseDto);

      expect(result.score).toBeNull();
      expect(aiService.analyzeResponseRealTime).not.toHaveBeenCalled();
    });
  });

  describe('submitBatchResponses', () => {
    it('should submit multiple responses with AI analysis', async () => {
      const responses = [
        {
          questionId: 'question-1',
          question: 'What is React?',
          transcription: 'React is a library',
          duration: 60,
        },
        {
          questionId: 'question-2',
          question: 'Tell me about yourself',
          transcription: 'I am a developer',
          duration: 90,
        },
      ];

      const mockAnalysis = {
        data: { confidence: 80 },
      };

      jest
        .spyOn(prismaService.interviewSession, 'findUnique')
        .mockResolvedValue(mockSession as any);
      jest
        .spyOn(aiService, 'analyzeResponseRealTime')
        .mockResolvedValue(mockAnalysis as any);
      jest
        .spyOn(prismaService.interviewResponse, 'createMany')
        .mockResolvedValue({ count: 2 });

      const result = await service.submitBatchResponses(
        'session-123',
        responses,
      );

      expect(result.success).toBe(true);
      expect(result.submittedCount).toBe(2);
      expect(aiService.analyzeResponseRealTime).toHaveBeenCalledTimes(2);
    });
  });
});
