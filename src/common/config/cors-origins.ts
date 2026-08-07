import { ConfigService } from '@nestjs/config';

// Matches every Vercel preview deployment for this project, e.g.
// https://kekehyuguestregistration-egopc3mgf.vercel.app
const VERCEL_PREVIEW_PATTERN = /^https:\/\/kekehyuguestregistration(-[a-z0-9-]+)?\.vercel\.app$/;

// Shared between the HTTP CORS setup (main.ts) and the WebSocket gateway
// (realtime.gateway.ts) so the two allow-lists can never drift apart.
export function getAllowedOrigins(configService: ConfigService): string[] {
  const defaultOrigins = [
    'https://kekehyuguestregistration.vercel.app', // Production frontend (Vercel)
    'http://localhost:4200', // Development frontend (local)
    'http://127.0.0.1:4200', // Development frontend (local IP)
    'http://localhost:3000', // Development alternative port
  ];
  const extraOrigins = (configService.get<string>('ALLOWED_ORIGINS') || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return [...new Set([...defaultOrigins, ...extraOrigins])];
}

export function isOriginAllowed(origin: string, configService: ConfigService): boolean {
  return (
    VERCEL_PREVIEW_PATTERN.test(origin) || getAllowedOrigins(configService).includes(origin)
  );
}
