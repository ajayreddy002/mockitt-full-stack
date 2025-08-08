import { Module } from '@nestjs/common';
import { CommonController } from './common.controller';
import { StorageService } from './services/storage.service';

@Module({
  providers: [StorageService],
  exports: [StorageService],
  controllers: [CommonController],
})
export class CommonModule {}
