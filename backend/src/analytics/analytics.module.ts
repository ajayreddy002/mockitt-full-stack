import { Module } from '@nestjs/common';
import { PredictiveAnalyticsService } from './predictive-analytics.service';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  providers: [PredictiveAnalyticsService],
  exports: [PredictiveAnalyticsService],
  imports: [PrismaModule],
})
export class AnalyticsModule {}
