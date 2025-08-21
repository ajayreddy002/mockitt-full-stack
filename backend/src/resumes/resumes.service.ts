import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../common/services/storage.service';
import { AIProviderService } from './ai-provider.service';
import { ConfigService } from '@nestjs/config';
import * as pdfParse from 'pdf-parse';
import { fileTypeFromBuffer } from 'file-type';

export interface UploadResumeDto {
  userId: string;
  file: Express.Multer.File;
  autoAnalyze?: boolean;
}

@Injectable()
export class ResumesService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private configService: ConfigService,
    private aiProviderService: AIProviderService,
  ) {}

  async uploadResume(uploadResumeDto: UploadResumeDto) {
    const { userId, file, autoAnalyze = true } = uploadResumeDto;

    // Validate file type
    await this.validateFile(file);

    // Generate unique file key
    const fileKey = this.storageService.generateFileKey(
      userId,
      file.originalname,
    );

    try {
      // Upload to Wasabi
      const fileUrl = await this.storageService.uploadFile(
        fileKey,
        file.buffer,
        file.mimetype,
      );

      // Extract text from PDF
      let extractedText = '';
      if (file.mimetype === 'application/pdf') {
        extractedText = await this.extractTextFromPDF(file.buffer);
      }

      // Save resume record to database
      const resume = await this.prisma.resume.create({
        data: {
          userId,
          fileName: fileKey,
          originalName: file.originalname,
          filePath: fileUrl,
          fileSize: file.size,
          mimeType: file.mimetype,
          extractedText,
        },
      });

      let analysisResult = null;
      if (autoAnalyze && extractedText) {
        try {
          analysisResult = await this.performAnalysis(resume.id, userId);
        } catch (error) {
          // Log error but don't fail the upload
          console.warn(
            `Auto-analysis failed for resume ${resume.id}:`,
            error.message,
          );
        }
      }

      return {
        id: resume.id,
        originalName: resume.originalName,
        fileSize: resume.fileSize,
        mimeType: resume.mimeType,
        uploadedAt: resume.createdAt,
        extractedText: extractedText.substring(0, 500) + '...', // Preview only
        autoAnalyzed: !!analysisResult,
        analysisResult: analysisResult, // Include analysis if successful
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to upload resume: ${error.message}`,
      );
    }
  }

  async getResumes(userId: string) {
    const resumes = await this.prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        originalName: true,
        fileSize: true,
        mimeType: true,
        analysisScore: true,
        atsScore: true,
        isAnalyzed: true,
        analyzedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return resumes;
  }

  private async performAnalysis(id: string, userId: string) {
    const resume = await this.prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    if (!resume.extractedText) {
      throw new BadRequestException('No text extracted from resume');
    }

    try {
      const analysis = await this.aiProviderService.analyzeResume(
        resume.extractedText,
      );

      // Update resume with analysis results
      const updatedResume = await this.prisma.resume.update({
        where: { id },
        data: {
          analysisScore: analysis.overallScore,
          atsScore: analysis.atsScore,
          skillsFound: analysis.skillsFound,
          skillsGaps: analysis.skillsGaps,
          strengths: analysis.strengths,
          improvements: analysis.improvements,
          suggestions: analysis.suggestions,
          isAnalyzed: true,
          analyzedAt: analysis.analysisDate,
        },
      });

      return {
        id: updatedResume.id,
        analysisScore: updatedResume.analysisScore,
        atsScore: updatedResume.atsScore,
        skillsFound: updatedResume.skillsFound,
        skillsGaps: updatedResume.skillsGaps,
        strengths: updatedResume.strengths,
        improvements: updatedResume.improvements,
        suggestions: updatedResume.suggestions,
        analyzedAt: updatedResume.analyzedAt,
        provider: analysis.provider,
      };
    } catch (error) {
      throw new BadRequestException(`Analysis failed: ${error.message}`);
    }
  }

  // ✅ RETRY ANALYSIS: For failed auto-analysis
  async retryAnalysis(id: string, userId: string) {
    // Reset analysis status first
    await this.prisma.resume.update({
      where: { id },
      data: {
        isAnalyzed: false,
        analysisScore: null,
        atsScore: null,
        analyzedAt: null,
      },
    });

    // Perform analysis again
    return this.performAnalysis(id, userId);
  }

  async getResume(id: string, userId: string) {
    const resume = await this.prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    return resume;
  }

  async deleteResume(id: string, userId: string) {
    const resume = await this.prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    try {
      // Delete from Wasabi storage
      await this.storageService.deleteFile(resume.fileName);

      // Delete from database
      await this.prisma.resume.delete({
        where: { id },
      });

      return { message: 'Resume deleted successfully' };
    } catch (error) {
      throw new BadRequestException(
        `Failed to delete resume: ${error.message}`,
      );
    }
  }

  async getDownloadUrl(id: string, userId: string) {
    const resume = await this.prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    const downloadUrl = await this.storageService.getSignedDownloadUrl(
      resume.fileName,
    );
    return { downloadUrl };
  }

  private async validateFile(file: Express.Multer.File) {
    const maxSize = this.configService.get<number>('MAX_FILE_SIZE', 10485760); // 10MB
    const allowedTypes = this.configService
      .get<string>('ALLOWED_FILE_TYPES', '')
      .split(',');

    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds limit of ${maxSize / 1024 / 1024}MB`,
      );
    }

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only PDF, DOC, and DOCX files are allowed',
      );
    }

    // Double-check file type by examining file buffer
    const detectedType = await fileTypeFromBuffer(file.buffer);
    if (
      file.mimetype === 'application/pdf' &&
      detectedType?.mime !== 'application/pdf'
    ) {
      throw new BadRequestException('File does not match expected type');
    }
  }

  private async extractTextFromPDF(buffer: Buffer): Promise<string> {
    try {
      const pdfData = await pdfParse(buffer);
      return pdfData.text;
    } catch (error) {
      console.error('PDF text extraction failed:', error);
      return ''; // Return empty string if extraction fails
    }
  }
  async analyzeResume(id: string, userId: string) {
    const resume = await this.prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    if (!resume.extractedText) {
      throw new BadRequestException('No text extracted from resume');
    }

    try {
      const analysis = await this.aiProviderService.analyzeResume(
        resume.extractedText,
      );

      // Update resume with analysis results
      const updatedResume = await this.prisma.resume.update({
        where: { id },
        data: {
          analysisScore: analysis.overallScore,
          atsScore: analysis.atsScore,
          skillsFound: analysis.skillsFound,
          skillsGaps: analysis.skillsGaps,
          strengths: analysis.strengths,
          improvements: analysis.improvements,
          suggestions: analysis.suggestions,
          isAnalyzed: true,
          analyzedAt: analysis.analysisDate,
        },
      });

      return {
        id: updatedResume.id,
        analysisScore: updatedResume.analysisScore,
        atsScore: updatedResume.atsScore,
        skillsFound: updatedResume.skillsFound,
        skillsGaps: updatedResume.skillsGaps,
        strengths: updatedResume.strengths,
        improvements: updatedResume.improvements,
        suggestions: updatedResume.suggestions,
        analyzedAt: updatedResume.analyzedAt,
        provider: analysis.provider,
      };
    } catch (error) {
      throw new BadRequestException(`Analysis failed: ${error.message}`);
    }
  }

  async getProviderStatus() {
    return this.aiProviderService.getAvailableProviders();
  }
}
