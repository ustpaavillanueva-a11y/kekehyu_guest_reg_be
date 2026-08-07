import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuestsService } from './guests.service';
import { GuestsController } from './guests.controller';
import { Guest } from './entities/guest.entity';
import { Reservation } from './entities/reservation.entity';
import { AccompanyingGuest } from './entities/accompanying-guest.entity';
import { GuestAgreement } from './entities/guest-agreement.entity';
import {
  LocalFileStorageService,
  STORAGE_SERVICE,
  SupabaseStorageService,
} from '../../common/services';
import { isLocalMode } from '../../common/config/runtime-mode';
import { RoomTypesModule } from '../room-types/room-types.module';
import { HotelSettingsModule } from '../hotel-settings/hotel-settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Guest,
      Reservation,
      AccompanyingGuest,
      GuestAgreement,
    ]),
    RoomTypesModule,
    HotelSettingsModule,
  ],
  controllers: [GuestsController],
  providers: [
    GuestsService,
    SupabaseStorageService,
    LocalFileStorageService,
    {
      provide: STORAGE_SERVICE,
      useFactory: (
        configService: ConfigService,
        supabaseStorageService: SupabaseStorageService,
        localFileStorageService: LocalFileStorageService,
      ) =>
        isLocalMode(configService)
          ? localFileStorageService
          : supabaseStorageService,
      inject: [
        ConfigService,
        SupabaseStorageService,
        LocalFileStorageService,
      ],
    },
  ],
  exports: [GuestsService],
})
export class GuestsModule {}
