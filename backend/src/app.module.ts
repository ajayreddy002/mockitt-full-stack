import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { ResumesService } from './resumes/resumes.service';
import { ResumesModule } from './resumes/resumes.module';
import { AiController } from './ai/ai.controller';
import { AiService } from './ai/ai.service';
import { AiModule } from './ai/ai.module';
import { InterviewsController } from './interviews/interviews.controller';
import { InterviewsModule } from './interviews/interviews.module';
import { InterviewsService } from './interviews/interviews.service';
import { DashboardModule } from './dashboard/dashboard.module';
import { CoursesController } from './courses/courses.controller';
import { CoursesModule } from './courses/courses.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { AdminController } from './admin/admin.controller';
import { AdminModule } from './admin/admin.module';
import { LessonsModule } from './lessons/lessons.module';
import { LessonsController } from './lessons/lessons.controller';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes config available globally
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CommonModule,
    ResumesModule,
    AiModule,
    InterviewsModule,
    DashboardModule,
    CoursesModule,
    QuizzesModule,
    AdminModule,
    LessonsModule,
    AnalyticsModule,
  ],
  controllers: [
    AppController,
    AiController,
    InterviewsController,
    CoursesController,
    AdminController,
    LessonsController,
  ],
  providers: [AppService, ResumesService, AiService, InterviewsService],
})
export class AppModule {}
