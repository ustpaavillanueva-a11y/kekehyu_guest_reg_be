import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiInfo(): { status: string; message: string; timestamp: string } {
    return {
      status: 'ok',
      message: 'Guest Registration API is running',
      timestamp: new Date().toISOString(),
    };
  }
}
