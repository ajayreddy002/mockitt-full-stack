import { Module } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { ResumesController } from './resumes.controller';
import { CommonModule } from '../common/common.module';
import { PrismaModule } from 'prisma/prisma.module';
import { AIProviderService } from './ai-provider.service';

@Module({
  imports: [PrismaModule, CommonModule],
  providers: [ResumesService, AIProviderService],
  controllers: [ResumesController],
  exports: [ResumesService, AIProviderService],
})
export class ResumesModule {}
