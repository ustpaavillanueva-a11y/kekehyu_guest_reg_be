import { ConfigService } from '@nestjs/config';
import * as path from 'path';

export type AppMode = 'cloud' | 'local';

export function getAppMode(configService: ConfigService): AppMode {
  const mode = configService.get<string>('APP_MODE')?.toLowerCase();
  return mode === 'local' ? 'local' : 'cloud';
}

export function isLocalMode(configService: ConfigService): boolean {
  return getAppMode(configService) === 'local';
}

export function getLocalDataRoot(): string {
  return path.join(process.cwd(), 'local-data');
}

export function getLocalUploadsRoot(): string {
  return path.join(getLocalDataRoot(), 'uploads');
}

export function getLocalDatabasePath(): string {
  return path.join(getLocalDataRoot(), 'guest-registration.sqlite');
}

export function getPublicBaseUrl(configService: ConfigService): string {
  const configured = configService.get<string>('PUBLIC_BASE_URL');
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  const port = configService.get<string>('PORT') || '3000';
  return `http://localhost:${port}`;
}
