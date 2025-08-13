import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { AIContentService } from 'src/ai/ai.content.service';

@Module({
  providers: [AdminService, AIContentService],
  imports: [PrismaModule],
  controllers: [AdminController],
  exports: [AdminService, AIContentService],
})
export class AdminModule {}
