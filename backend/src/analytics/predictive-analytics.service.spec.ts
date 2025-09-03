import { Test, TestingModule } from '@nestjs/testing';
import { PredictiveAnalyticsService } from './predictive-analytics.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('PredictiveAnalyticsService', () => {
  let service: PredictiveAnalyticsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PredictiveAnalyticsService,
        {
          provide: PrismaService,
          useValue: {
            speechAnalysis: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PredictiveAnalyticsService>(
      PredictiveAnalyticsService,
    );
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return default insights for new users', async () => {
    jest.spyOn(prisma.speechAnalysis, 'findMany').mockResolvedValue([]);

    const result = await service.generatePredictiveInsights('test-user-id');

    expect(result.currentPerformance.overallScore).toBe(0);
    expect(result.recommendations.focusAreas).toContain(
      'Complete your first interview session',
    );
  });
});
