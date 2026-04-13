import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelSettingsService } from './hotel-settings.service';
import { HotelSettingsController } from './hotel-settings.controller';
import { HotelSetting } from './entities/hotel-setting.entity';
import { PolicyTemplate } from './entities/policy-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HotelSetting, PolicyTemplate])],
  controllers: [HotelSettingsController],
  providers: [HotelSettingsService],
  exports: [HotelSettingsService],
})
export class HotelSettingsModule {}
