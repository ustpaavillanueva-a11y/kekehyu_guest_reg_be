import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Controller('')
export class RootController {
  @Get()
  @Public()
  getRoot(): { status: string; message: string; timestamp: string } {
    return {
      status: 'ok',
      message: 'Guest Registration API is running',
      timestamp: new Date().toISOString(),
    };
  }
}
