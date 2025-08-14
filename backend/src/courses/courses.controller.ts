import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  ConflictException,
  Delete,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CoursesService } from './courses.service';
import { CourseFiltersDto, UpdateProgressDto } from './dto'; // EnrollmentDto
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async getAllCourses(@Query() filters: CourseFiltersDto) {
    return this.coursesService.getAllCourses(filters);
  }

  @Get('my-courses')
  async getMyEnrolledCourses(@Request() req) {
    return this.coursesService.getEnrolledCourses(req.user.id);
  }

  @Get(':id')
  async getCourseById(@Param('id', ParseUUIDPipe) courseId: string) {
    return this.coursesService.getCourseById(courseId);
  }

  @Get(':id/progress')
  async getCourseProgress(
    @Param('id', ParseUUIDPipe) courseId: string,
    @Request() req,
  ) {
    return this.coursesService.getCourseProgress(req.user.id, courseId);
  }

  @Patch('lessons/:lessonId/progress')
  async updateLessonProgress(
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Request() req,
    @Body() progressData: UpdateProgressDto,
  ) {
    return this.coursesService.updateLessonProgress(
      req.user.id,
      lessonId,
      progressData,
    );
  }

  @Get(':id/modules')
  async getCourseModules(@Param('id', ParseUUIDPipe) courseId: string) {
    return this.coursesService.getCourseModules(courseId);
  }
  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Enroll user in course' })
  @ApiResponse({ status: 201, description: 'Successfully enrolled' })
  @ApiResponse({ status: 409, description: 'Already enrolled' })
  @ApiResponse({ status: 403, description: 'Premium subscription required' })
  async enrollInCourse(@Param('id') courseId: string, @Request() req) {
    try {
      return await this.coursesService.enrollUser(courseId, req.user.id);
    } catch (error) {
      if (error instanceof ConflictException) {
        return { success: false, message: 'Already enrolled in this course' };
      }
      throw error;
    }
  }

  // @Post(':id/enroll')
  // async enrollInCourse(
  //   @Param('id', ParseUUIDPipe) courseId: string,
  //   @Request() req,
  //   @Body() enrollmentData: EnrollmentDto,
  // ) {
  //   return this.coursesService.enrollInCourse(
  //     req.user.id,
  //     courseId,
  //     enrollmentData,
  //   );
  // }

  @Delete(':id/enroll')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Unenroll user from course' })
  async unenrollFromCourse(@Param('id') courseId: string, @Request() req) {
    return this.coursesService.unenrollUser(courseId, req.user.id);
  }

  @Get(':id/enrollment-status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Check user enrollment status' })
  async getEnrollmentStatus(@Param('id') courseId: string, @Request() req) {
    return this.coursesService.checkUserEnrollment(courseId, req.user.id);
  }

  @Get('/enrollments/:userId')
  @ApiOperation({ summary: 'Get enrollments for a specific user' })
  @UseGuards(JwtAuthGuard)
  async getUserEnrollments(
    @Param('userId', new ParseUUIDPipe({ version: '4' })) userId: string,
    @Request() req,
  ) {
    if (userId !== req.user.id) {
      throw new ForbiddenException('Cannot access other user enrollments');
    }
    console.log('Fetching user enrollments for user ID:', req.user.id);
    return this.coursesService.getUserEnrollments(req.user.id);
  }
}
