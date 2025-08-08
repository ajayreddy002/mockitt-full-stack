import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { PrismaModule } from 'prisma/prisma.module'; // Import your Prisma module

@Module({
  imports: [
    ConfigModule,
    PrismaModule, // Add PrismaModule to imports
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
