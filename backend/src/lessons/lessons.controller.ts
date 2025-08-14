// backend/src/lessons/lessons.controller.ts
import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LessonsService } from './lessons.service';
import { UpdateProgressDto } from './dto/update-progress.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('lessons')
@Controller('lessons')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson by ID with context' })
  @ApiResponse({
    status: 200,
    description: 'Lesson details with navigation context',
  })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async getLessonById(@Param('id') id: string, @Request() req) {
    return this.lessonsService.findByIdWithContext(id, req.user.id);
  }

  @Get(':id/navigation')
  @ApiOperation({ summary: 'Get lesson navigation (previous/next)' })
  async getLessonNavigation(@Param('id') id: string, @Request() req) {
    return this.lessonsService.getLessonNavigation(id, req.user.id);
  }

  @Put(':id/progress')
  @ApiOperation({ summary: 'Update lesson progress' })
  async updateProgress(
    @Param('id') id: string,
    @Body() progressData: UpdateProgressDto,
    @Request() req,
  ) {
    return this.lessonsService.updateProgress(id, req.user.id, progressData);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark lesson as completed' })
  async markComplete(@Param('id') id: string, @Request() req) {
    return this.lessonsService.markComplete(id, req.user.id);
  }

  @Get(':id/quiz')
  @ApiOperation({ summary: 'Get lesson quiz if available' })
  async getLessonQuiz(@Param('id') id: string, @Request() req) {
    return this.lessonsService.getLessonQuiz(id, req.user.id);
  }

  @Post(':id/time-spent')
  @ApiOperation({ summary: 'Track time spent on lesson' })
  async trackTimeSpent(
    @Param('id') id: string,
    @Body() { timeSpent }: { timeSpent: number },
    @Request() req,
  ) {
    return this.lessonsService.trackTimeSpent(id, req.user.id, timeSpent);
  }

  @Get(':id/notes')
  @ApiOperation({ summary: 'Get user notes for lesson' })
  async getLessonNotes(@Param('id') id: string, @Request() req) {
    return this.lessonsService.getUserNotes(id, req.user.id);
  }

  @Put(':id/notes')
  @ApiOperation({ summary: 'Update user notes for lesson' })
  async updateLessonNotes(
    @Param('id') id: string,
    @Body() { notes }: { notes: string },
    @Request() req,
  ) {
    return this.lessonsService.updateUserNotes(id, req.user.id, notes);
  }
}
