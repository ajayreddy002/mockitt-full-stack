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
  ],
  controllers: [AppController, AiController, InterviewsController],
  providers: [AppService, ResumesService, AiService, InterviewsService],
})
export class AppModule {}
