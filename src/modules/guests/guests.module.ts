import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuestsService } from './guests.service';
import { GuestsController } from './guests.controller';
import { Guest } from './entities/guest.entity';
import { Reservation } from './entities/reservation.entity';
import { AccompanyingGuest } from './entities/accompanying-guest.entity';
import { GuestAgreement } from './entities/guest-agreement.entity';
import { SupabaseStorageService } from '../../common/services/supabase-storage.service';
import { RoomTypesModule } from '../room-types/room-types.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Guest,
      Reservation,
      AccompanyingGuest,
      GuestAgreement,
    ]),
    RoomTypesModule,
  ],
  controllers: [GuestsController],
  providers: [GuestsService, SupabaseStorageService],
  exports: [GuestsService],
})
export class GuestsModule {}
