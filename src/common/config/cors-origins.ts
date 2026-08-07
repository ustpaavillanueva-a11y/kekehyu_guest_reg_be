import { ConfigService } from '@nestjs/config';

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
