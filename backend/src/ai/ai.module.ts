import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { PrismaModule } from 'prisma/prisma.module'; // Import your Prisma module
import { IntelligentCoachingService } from './intelligent-coaching.service';

@Module({
  imports: [
    ConfigModule,
    PrismaModule, // Add PrismaModule to imports
  ],
  controllers: [AiController],
  providers: [AiService, IntelligentCoachingService],
  exports: [AiService, IntelligentCoachingService],
})
export class AiModule {}
