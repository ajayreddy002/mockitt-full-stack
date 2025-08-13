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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CoursesService } from './courses.service';
import { CourseFiltersDto, EnrollmentDto, UpdateProgressDto } from './dto';

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

  @Post(':id/enroll')
  async enrollInCourse(
    @Param('id', ParseUUIDPipe) courseId: string,
    @Request() req,
    @Body() enrollmentData: EnrollmentDto,
  ) {
    return this.coursesService.enrollInCourse(
      req.user.id,
      courseId,
      enrollmentData,
    );
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
}
