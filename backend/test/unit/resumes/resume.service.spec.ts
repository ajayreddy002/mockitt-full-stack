import { Test, TestingModule } from '@nestjs/testing';
import { ResumesService } from '../../../src/resumes/resumes.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { StorageService } from '../../../src/common/services/storage.service';
import { AIProviderService } from '../../../src/resumes/ai-provider.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ResumesService', () => {
  let service: ResumesService;
  let prismaService: PrismaService;
  let storageService: StorageService;
  let aiProviderService: AIProviderService;

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'resume.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: 1024000,
    buffer: Buffer.from('mock pdf content'),
    stream: null,
    destination: '',
    filename: '',
    path: '',
  };

  const mockResume = {
    id: 'resume-123',
    userId: 'user-123',
    fileName: 'user-123/resume.pdf',
    originalName: 'resume.pdf',
    filePath: 'https://storage.example.com/user-123/resume.pdf',
    fileSize: 1024000,
    mimeType: 'application/pdf',
    extractedText: 'Software Engineer with 5 years experience...',
    analysisScore: null,
    atsScore: null,
    isAnalyzed: false,
    analyzedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResumesService,
        {
          provide: PrismaService,
          useValue: {
            resume: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: StorageService,
          useValue: {
            generateFileKey: jest.fn(),
            uploadFile: jest.fn(),
            deleteFile: jest.fn(),
            getSignedDownloadUrl: jest.fn(),
          },
        },
        {
          provide: AIProviderService,
          useValue: {
            analyzeResume: jest.fn(),
            getAvailableProviders: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key, defaultValue) => {
              const config = {
                MAX_FILE_SIZE: 10485760,
                ALLOWED_FILE_TYPES: 'application/pdf,application/msword',
              };
              return config[key] || defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ResumesService>(ResumesService);
    prismaService = module.get<PrismaService>(PrismaService);
    storageService = module.get<StorageService>(StorageService);
    aiProviderService = module.get<AIProviderService>(AIProviderService);
  });

  describe('uploadResume', () => {
    it('should auto-analyze resume when requested', async () => {
      const uploadDto = {
        userId: 'user-123',
        file: mockFile,
        autoAnalyze: true,
      };

      const mockAnalysis = {
        overallScore: 85,
        atsScore: 78,
        skillsFound: ['JavaScript', 'React'],
        skillsGaps: ['TypeScript'],
        strengths: ['Strong technical background'],
        improvements: ['Add more quantifiable achievements'],
        suggestions: ['Include more specific metrics'],
        provider: 'gemini',
        analysisDate: new Date(),
      };

      jest
        .spyOn(storageService, 'generateFileKey')
        .mockReturnValue('user-123/resume.pdf');
      jest
        .spyOn(storageService, 'uploadFile')
        .mockResolvedValue('https://storage.example.com/user-123/resume.pdf');
      jest
        .spyOn(prismaService.resume, 'create')
        .mockResolvedValue(mockResume as any);

      // ✅ Mock the findFirst call for performAnalysis
      jest.spyOn(prismaService.resume, 'findFirst').mockResolvedValue({
        ...(mockResume as any),
        extractedText: 'Software Engineer with 5 years experience...',
      });

      jest
        .spyOn(aiProviderService, 'analyzeResume')
        .mockResolvedValue(mockAnalysis as any);
      jest.spyOn(prismaService.resume, 'update').mockResolvedValue({
        ...(mockResume as any),
        analysisScore: 85,
        atsScore: 78,
        isAnalyzed: true,
      });

      // Mock PDF text extraction
      jest
        .spyOn(service as any, 'extractTextFromPDF')
        .mockResolvedValue('Extracted text content');

      const result = await service.uploadResume(uploadDto);

      expect(result.autoAnalyzed).toBe(true);
      expect(result.analysisResult).toBeDefined();
      expect(aiProviderService.analyzeResume).toHaveBeenCalled();
    });

    it('should upload resume successfully without auto-analysis', async () => {
      const uploadDto = {
        userId: 'user-123',
        file: mockFile,
        autoAnalyze: false,
      };

      jest
        .spyOn(storageService, 'generateFileKey')
        .mockReturnValue('user-123/resume.pdf');
      jest
        .spyOn(storageService, 'uploadFile')
        .mockResolvedValue('https://storage.example.com/user-123/resume.pdf');
      jest
        .spyOn(prismaService.resume, 'create')
        .mockResolvedValue(mockResume as any);

      // Mock PDF text extraction
      jest
        .spyOn(service as any, 'extractTextFromPDF')
        .mockResolvedValue('Extracted text content');

      const result = await service.uploadResume(uploadDto);

      expect(result.id).toBe('resume-123');
      expect(result.originalName).toBe('resume.pdf');
      expect(result.autoAnalyzed).toBe(false);
      expect(storageService.uploadFile).toHaveBeenCalledWith(
        'user-123/resume.pdf',
        mockFile.buffer,
        mockFile.mimetype,
      );
    });

    it('should throw BadRequestException for invalid file size', async () => {
      const largeFile = { ...mockFile, size: 20000000 }; // 20MB
      const uploadDto = {
        userId: 'user-123',
        file: largeFile,
      };

      await expect(service.uploadResume(uploadDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should auto-analyze resume when requested', async () => {
      const uploadDto = {
        userId: 'user-123',
        file: mockFile,
        autoAnalyze: true,
      };

      const mockAnalysis = {
        overallScore: 85,
        atsScore: 78,
        skillsFound: ['JavaScript', 'React'],
        skillsGaps: ['TypeScript'],
        strengths: ['Strong technical background'],
        improvements: ['Add more quantifiable achievements'],
        suggestions: ['Include more specific metrics'],
        provider: 'gemini',
        analysisDate: new Date(),
      };

      // ✅ Mock storage service
      jest
        .spyOn(storageService, 'generateFileKey')
        .mockReturnValue('user-123/resume.pdf');
      jest
        .spyOn(storageService, 'uploadFile')
        .mockResolvedValue('https://storage.example.com/user-123/resume.pdf');

      // ✅ Mock prisma create (initial resume creation)
      jest
        .spyOn(prismaService.resume, 'create')
        .mockResolvedValue(mockResume as any);

      // ✅ CRITICAL: Mock prisma findFirst for the performAnalysis method
      jest.spyOn(prismaService.resume, 'findFirst').mockResolvedValue({
        ...mockResume,
        extractedText: 'Software Engineer with 5 years experience...', // Must have text
      } as any);

      // ✅ Mock PDF text extraction
      jest
        .spyOn(service as any, 'extractTextFromPDF')
        .mockResolvedValue('Extracted text content');

      // ✅ Mock AI provider service
      jest
        .spyOn(aiProviderService, 'analyzeResume')
        .mockResolvedValue(mockAnalysis as any);

      // ✅ Mock prisma update (for analysis results)
      jest.spyOn(prismaService.resume, 'update').mockResolvedValue({
        ...(mockResume as any),
        analysisScore: 85,
        atsScore: 78,
        isAnalyzed: true,
        analyzedAt: new Date(),
      });

      const result = await service.uploadResume(uploadDto);

      expect(result.autoAnalyzed).toBe(true);
      expect(result.analysisResult).toBeDefined();
      expect(aiProviderService.analyzeResume).toHaveBeenCalled();
      expect(prismaService.resume.findFirst).toHaveBeenCalledWith({
        where: { id: 'resume-123', userId: 'user-123' },
      });
    });
  });

  describe('analyzeResume', () => {
    it('should analyze resume successfully', async () => {
      const mockAnalysis = {
        overallScore: 85,
        atsScore: 78,
        skillsFound: ['JavaScript', 'React'],
        skillsGaps: ['TypeScript'],
        strengths: ['Strong technical background'],
        improvements: ['Add more quantifiable achievements'],
        suggestions: ['Include more specific metrics'],
        provider: 'gemini',
        analysisDate: new Date(),
      };

      const analyzedResume = {
        ...mockResume,
        analysisScore: 85,
        atsScore: 78,
        skillsFound: ['JavaScript', 'React'],
        skillsGaps: ['TypeScript'],
        strengths: ['Strong technical background'],
        improvements: ['Add more quantifiable achievements'],
        suggestions: ['Include more specific metrics'],
        isAnalyzed: true,
        analyzedAt: new Date(),
      };

      jest
        .spyOn(prismaService.resume, 'findFirst')
        .mockResolvedValue(mockResume as any);
      jest
        .spyOn(aiProviderService, 'analyzeResume')
        .mockResolvedValue(mockAnalysis as any);
      jest
        .spyOn(prismaService.resume, 'update')
        .mockResolvedValue(analyzedResume as any);

      const result = await service.analyzeResume('resume-123', 'user-123');

      expect(result.analysisScore).toBe(85);
      expect(result.atsScore).toBe(78);
      expect(result.provider).toBe('gemini');
    });

    it('should throw NotFoundException for non-existent resume', async () => {
      jest.spyOn(prismaService.resume, 'findFirst').mockResolvedValue(null);

      await expect(
        service.analyzeResume('non-existent', 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when no text extracted', async () => {
      const resumeWithoutText = { ...mockResume, extractedText: '' };

      jest
        .spyOn(prismaService.resume, 'findFirst')
        .mockResolvedValue(resumeWithoutText as any);

      await expect(
        service.analyzeResume('resume-123', 'user-123'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getResumes', () => {
    it('should return user resumes', async () => {
      const mockResumes = [
        {
          id: 'resume-123',
          originalName: 'resume.pdf',
          fileSize: 1024000,
          mimeType: 'application/pdf',
          analysisScore: 85,
          atsScore: 78,
          isAnalyzed: true,
          analyzedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest
        .spyOn(prismaService.resume, 'findMany')
        .mockResolvedValue(mockResumes as any);

      const result = await service.getResumes('user-123');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('resume-123');
    });
  });

  describe('deleteResume', () => {
    it('should delete resume successfully', async () => {
      jest
        .spyOn(prismaService.resume, 'findFirst')
        .mockResolvedValue(mockResume as any);
      jest.spyOn(storageService, 'deleteFile').mockResolvedValue(undefined);
      jest
        .spyOn(prismaService.resume, 'delete')
        .mockResolvedValue(mockResume as any);

      const result = await service.deleteResume('resume-123', 'user-123');

      expect(result.message).toBe('Resume deleted successfully');
      expect(storageService.deleteFile).toHaveBeenCalledWith(
        'user-123/resume.pdf',
      );
    });

    it('should throw NotFoundException for non-existent resume', async () => {
      jest.spyOn(prismaService.resume, 'findFirst').mockResolvedValue(null);

      await expect(
        service.deleteResume('non-existent', 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('retryAnalysis', () => {
    it('should retry failed analysis', async () => {
      const mockAnalysis = {
        overallScore: 85,
        atsScore: 78,
        skillsFound: ['JavaScript', 'React'],
        skillsGaps: ['TypeScript'],
        strengths: ['Strong technical background'],
        improvements: ['Add more quantifiable achievements'],
        suggestions: ['Include more specific metrics'],
        provider: 'gemini',
        analysisDate: new Date(),
      };

      // Mock the reset update
      jest.spyOn(prismaService.resume, 'update').mockResolvedValueOnce({
        ...(mockResume as any),
        isAnalyzed: false,
        analysisScore: null,
        atsScore: null,
        analyzedAt: null,
      });

      // Mock the analysis flow
      jest
        .spyOn(prismaService.resume, 'findFirst')
        .mockResolvedValue(mockResume as any);
      jest
        .spyOn(aiProviderService, 'analyzeResume')
        .mockResolvedValue(mockAnalysis as any);
      jest.spyOn(prismaService.resume, 'update').mockResolvedValueOnce({
        ...(mockResume as any),
        analysisScore: 85,
        atsScore: 78,
        isAnalyzed: true,
        analyzedAt: new Date(),
      });

      const result = await service.retryAnalysis('resume-123', 'user-123');

      expect(result.analysisScore).toBe(85);
      expect(prismaService.resume.update).toHaveBeenCalledTimes(2); // Reset + Analysis update
    });
  });
});
