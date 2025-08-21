import { Module } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  providers: [QuizzesService, PrismaService],
  controllers: [QuizzesController],
  exports: [QuizzesService],
  imports: [PrismaModule],
})
export class QuizzesModule {}
