import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResumesService } from './resumes.service';

@ApiTags('resumes')
@Controller('resumes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}
  @Get('providers')
  @ApiOperation({ summary: 'Get available AI provider status' })
  @ApiResponse({
    status: 200,
    description: 'Provider status retrieved successfully',
  })
  async getProviderStatus() {
    return this.resumesService.getProviderStatus();
  }
  @Post('upload')
  @ApiOperation({ summary: 'Upload a resume file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Resume uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or upload failed' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadResume(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.resumesService.uploadResume({
      userId: req.user.userId,
      file,
    });
  }
  @Post(':id/retry-analysis')
  @ApiOperation({ summary: 'Retry failed resume analysis' })
  @ApiResponse({ status: 200, description: 'Analysis retried successfully' })
  async retryAnalysis(@Param('id') id: string, @Request() req) {
    return this.resumesService.retryAnalysis(id, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all resumes for current user' })
  @ApiResponse({ status: 200, description: 'Resumes retrieved successfully' })
  async getResumes(@Request() req) {
    return this.resumesService.getResumes(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific resume details' })
  @ApiResponse({
    status: 200,
    description: 'Resume details retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Resume not found' })
  async getResume(@Param('id') id: string, @Request() req) {
    return this.resumesService.getResume(id, req.user.userId);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get resume download URL' })
  @ApiResponse({
    status: 200,
    description: 'Download URL generated successfully',
  })
  @ApiResponse({ status: 404, description: 'Resume not found' })
  async getDownloadUrl(@Param('id') id: string, @Request() req) {
    return this.resumesService.getDownloadUrl(id, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a resume' })
  @ApiResponse({ status: 200, description: 'Resume deleted successfully' })
  @ApiResponse({ status: 404, description: 'Resume not found' })
  async deleteResume(@Param('id') id: string, @Request() req) {
    return this.resumesService.deleteResume(id, req.user.userId);
  }
  @Post(':id/analyze')
  @ApiOperation({ summary: 'Analyze resume with AI' })
  @ApiResponse({ status: 200, description: 'Resume analyzed successfully' })
  @ApiResponse({ status: 404, description: 'Resume not found' })
  async analyzeResume(@Param('id') id: string, @Request() req) {
    return this.resumesService.analyzeResume(id, req.user.userId);
  }
}
