import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Reservation } from './reservation.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('accompanying_guests')
export class AccompanyingGuest {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'reservation_id' })
  reservationId: string;

  @ManyToOne(() => Reservation, (res) => res.accompanyingGuests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation;

  @ApiProperty()
  @Column({ length: 200 })
  name: string;

  @ApiProperty()
  @Column({ name: 'valid_id_presented', default: false })
  validIdPresented: boolean;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  signature: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
