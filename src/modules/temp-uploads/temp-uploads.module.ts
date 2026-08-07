import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TempUploadsService } from './temp-uploads.service';
import { TempUploadsController } from './temp-uploads.controller';
import { TempStorageService } from './temp-storage.service';
import { TempUpload } from './entities/temp-upload.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TempUpload])],
  controllers: [TempUploadsController],
  providers: [TempUploadsService, TempStorageService],
  exports: [TempUploadsService],
})
export class TempUploadsModule {}
