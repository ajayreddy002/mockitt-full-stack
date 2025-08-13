// backend/src/admin/admin.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  // Request,
} from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminService } from './admin.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CreateQuizDto,
  UpdateUserDto,
} from './dto';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import {
  AIContentService,
  CourseGenerationPrompt,
  QuizGenerationPrompt,
} from 'src/ai/ai.content.service';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
@UseGuards(AdminGuard)
@Roles(UserRole.ADMIN) // Additional role check
@ApiBearerAuth()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly aiContentService: AIContentService, // Inject AI content service
  ) {}

  // Dashboard Analytics
  @Get('dashboard')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('analytics')
  async getAnalytics(@Query() filters: any) {
    return this.adminService.getAnalytics(filters);
  }

  // Course Management
  @Get('courses')
  async getCourses(@Query() filters: any) {
    return this.adminService.getCourses(filters);
  }

  @Get('courses/:id')
  async getCourseById(@Param('id', ParseUUIDPipe) courseId: string) {
    return this.adminService.getCourseById(courseId);
  }

  @ApiBody({ type: CreateCourseDto })
  @Post('courses')
  async createCourse(@Body() createCourseDto: CreateCourseDto) {
    return this.adminService.createCourse(createCourseDto);
  }

  @Put('courses/:id')
  async updateCourse(
    @Param('id', ParseUUIDPipe) courseId: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.adminService.updateCourse(courseId, updateCourseDto);
  }

  @Delete('courses/:id')
  async deleteCourse(@Param('id', ParseUUIDPipe) courseId: string) {
    return this.adminService.deleteCourse(courseId);
  }

  @Put('courses/:id/publish')
  async publishCourse(@Param('id', ParseUUIDPipe) courseId: string) {
    return this.adminService.toggleCoursePublication(courseId);
  }

  // Module Management
  @Post('courses/:courseId/modules')
  async createModule(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() moduleData: any,
  ) {
    return this.adminService.createModule(courseId, moduleData);
  }

  @Put('modules/:id')
  async updateModule(
    @Param('id', ParseUUIDPipe) moduleId: string,
    @Body() moduleData: any,
  ) {
    return this.adminService.updateModule(moduleId, moduleData);
  }

  @Delete('modules/:id')
  async deleteModule(@Param('id', ParseUUIDPipe) moduleId: string) {
    return this.adminService.deleteModule(moduleId);
  }

  // Lesson Management
  @Post('modules/:moduleId/lessons')
  async createLesson(
    @Param('moduleId', ParseUUIDPipe) moduleId: string,
    @Body() lessonData: any,
  ) {
    return this.adminService.createLesson(moduleId, lessonData);
  }

  @Put('lessons/:id')
  async updateLesson(
    @Param('id', ParseUUIDPipe) lessonId: string,
    @Body() lessonData: any,
  ) {
    return this.adminService.updateLesson(lessonId, lessonData);
  }

  @Delete('lessons/:id')
  async deleteLesson(@Param('id', ParseUUIDPipe) lessonId: string) {
    return this.adminService.deleteLesson(lessonId);
  }

  // Quiz Management
  @Get('quizzes')
  async getQuizzes(@Query() filters: any) {
    return this.adminService.getQuizzes(filters);
  }

  @Get('quizzes/:id')
  async getQuizById(@Param('id', ParseUUIDPipe) quizId: string) {
    return this.adminService.getQuizById(quizId);
  }

  @Post('quizzes')
  async createQuiz(@Body() createQuizDto: CreateQuizDto) {
    return this.adminService.createQuiz(createQuizDto);
  }

  @Put('quizzes/:id')
  async updateQuiz(
    @Param('id', ParseUUIDPipe) quizId: string,
    @Body() updateQuizDto: any,
  ) {
    return this.adminService.updateQuiz(quizId, updateQuizDto);
  }

  @Delete('quizzes/:id')
  async deleteQuiz(@Param('id', ParseUUIDPipe) quizId: string) {
    return this.adminService.deleteQuiz(quizId);
  }

  // Question Management
  @Post('quizzes/:quizId/questions')
  async addQuestion(
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Body() questionData: any,
  ) {
    return this.adminService.addQuestion(quizId, questionData);
  }

  @Put('questions/:id')
  async updateQuestion(
    @Param('id', ParseUUIDPipe) questionId: string,
    @Body() questionData: any,
  ) {
    return this.adminService.updateQuestion(questionId, questionData);
  }

  @Delete('questions/:id')
  async deleteQuestion(@Param('id', ParseUUIDPipe) questionId: string) {
    return this.adminService.deleteQuestion(questionId);
  }

  // User Management
  @Get('users')
  async getUsers(@Query() filters: any) {
    return this.adminService.getUsers(filters);
  }

  @Get('users/:id')
  async getUserById(@Param('id', ParseUUIDPipe) userId: string) {
    return this.adminService.getUserById(userId);
  }

  @Put('users/:id')
  async updateUser(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.adminService.updateUser(userId, updateUserDto);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id', ParseUUIDPipe) userId: string) {
    return this.adminService.deleteUser(userId);
  }

  @Put('users/:id/premium')
  async toggleUserPremium(@Param('id', ParseUUIDPipe) userId: string) {
    return this.adminService.toggleUserPremium(userId);
  }

  // Content Analytics
  @Get('courses/:id/analytics')
  async getCourseAnalytics(@Param('id', ParseUUIDPipe) courseId: string) {
    return this.adminService.getCourseAnalytics(courseId);
  }

  @Get('users/:id/activity')
  async getUserActivity(@Param('id', ParseUUIDPipe) userId: string) {
    return this.adminService.getUserActivity(userId);
  }

  @Post('courses/ai/generate')
  async generateCourse(@Body() prompt: CourseGenerationPrompt) {
    return this.aiContentService.generateCourse(prompt);
  }

  @Post('courses/ai/generate-lesson')
  async generateLessonContent(@Body() { topic, duration, level }: any) {
    return this.aiContentService.generateLessonContent(topic, duration, level);
  }

  // ✅ AI Quiz Generation
  @Post('quizzes/ai/generate')
  async generateQuiz(@Body() prompt: QuizGenerationPrompt) {
    return this.aiContentService.generateQuiz(prompt);
  }
}
