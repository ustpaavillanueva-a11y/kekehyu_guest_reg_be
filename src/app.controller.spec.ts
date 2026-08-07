import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getApiInfo', () => {
    it('should return API status info', () => {
      const result = appController.getApiInfo();
      expect(result.status).toBe('ok');
      expect(result.message).toBe('Guest Registration API is running');
      expect(typeof result.timestamp).toBe('string');
    });
  });
});
