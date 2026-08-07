import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, LessThanOrEqual, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TempUpload } from './entities/temp-upload.entity';
import { TempStorageService } from './temp-storage.service';

const EXPIRY_MS = 60 * 60 * 1000;

@Injectable()
export class TempUploadsService {
  private readonly logger = new Logger(TempUploadsService.name);

  constructor(
    @InjectRepository(TempUpload)
    private readonly tempUploadRepository: Repository<TempUpload>,
    private readonly tempStorageService: TempStorageService,
  ) {}

  async upload(file: Buffer, fileName: string, uploadedById?: string): Promise<TempUpload> {
    const { path, url } = await this.tempStorageService.uploadPdf(file, fileName);

    const tempUpload = this.tempUploadRepository.create({
      filePath: path,
      fileUrl: url,
      fileName,
      uploadedById,
      expiresAt: new Date(Date.now() + EXPIRY_MS),
    });

    return this.tempUploadRepository.save(tempUpload);
  }

  async findAllActive(): Promise<TempUpload[]> {
    return this.tempUploadRepository.find({
      where: { expiresAt: MoreThan(new Date()) },
      order: { createdAt: 'DESC' },
    });
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async cleanupExpired(): Promise<void> {
    const expired = await this.tempUploadRepository.find({
      where: { expiresAt: LessThanOrEqual(new Date()) },
    });

    for (const upload of expired) {
      try {
        await this.tempStorageService.deletePdf(upload.filePath);
      } catch (error) {
        this.logger.warn(`Failed to delete storage file ${upload.filePath}: ${error.message}`);
      }
      await this.tempUploadRepository.delete(upload.id);
    }

    if (expired.length > 0) {
      this.logger.log(`Cleaned up ${expired.length} expired temp upload(s)`);
    }
  }
}
