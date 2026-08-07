import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import * as path from 'path';
import { getLocalUploadsRoot, getPublicBaseUrl } from '../config/runtime-mode';
import { StorageService } from './storage.service';

@Injectable()
export class LocalFileStorageService implements StorageService {
  private readonly uploadsRoot = getLocalUploadsRoot();

  constructor(private readonly configService: ConfigService) {}

  async uploadPdf(
    file: Buffer,
    fileName: string,
    guestId: string,
  ): Promise<string> {
    const safeFileName = this.sanitizeFileName(fileName);
    const guestDir = path.join(this.uploadsRoot, guestId);
    const targetPath = path.join(guestDir, safeFileName);

    await fs.mkdir(guestDir, { recursive: true });
    await fs.writeFile(targetPath, file);

    const relativePath = path
      .relative(this.uploadsRoot, targetPath)
      .split(path.sep)
      .join('/');

    return this.getPublicUrl(relativePath);
  }

  async deletePdf(filePath: string): Promise<void> {
    const relativePath = this.extractRelativePath(filePath);
    const targetPath = path.join(this.uploadsRoot, relativePath);

    try {
      await fs.unlink(targetPath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  getPublicUrl(filePath: string): string {
    const relativePath = this.extractRelativePath(filePath);
    return `${getPublicBaseUrl(this.configService)}/uploads/${relativePath}`;
  }

  private extractRelativePath(filePath: string): string {
    return filePath
      .replace(/^https?:\/\/[^/]+\/uploads\//i, '')
      .replace(/^\/+/, '')
      .split(path.sep)
      .join('/');
  }

  private sanitizeFileName(fileName: string): string {
    return path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
  }
}
