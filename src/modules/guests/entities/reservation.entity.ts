import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Guest } from './guest.entity';
import { RoomType } from '../../room-types/entities/room-type.entity';
import { AccompanyingGuest } from './accompanying-guest.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum ReservationStatus {
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  CANCELLED = 'cancelled',
}

@Entity('reservations')
export class Reservation {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'guest_id' })
  guestId: string;

  @ManyToOne(() => Guest, (guest) => guest.reservations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guest_id' })
  guest: Guest;

  @ApiProperty()
  @Column({ name: 'reservation_number', unique: true })
  reservationNumber: string;

  @ApiProperty()
  @Column({ name: 'room_number', length: 20 })
  roomNumber: string;

  @Column({ name: 'room_type_id', nullable: true })
  roomTypeId: string;

  @ManyToOne(() => RoomType, { nullable: true })
  @JoinColumn({ name: 'room_type_id' })
  roomType: RoomType;

  @ApiProperty()
  @Column({ name: 'check_in_date', type: 'date' })
  checkInDate: Date;

  @ApiProperty()
  @Column({ name: 'check_out_date', type: 'date', nullable: true })
  checkOutDate: Date;

  @ApiProperty()
  @Column({ name: 'check_in_time', type: 'time', nullable: true })
  checkInTime: string;

  @ApiProperty()
  @Column({ name: 'check_out_time', type: 'time', nullable: true })
  checkOutTime: string;

  @ApiProperty({ enum: ReservationStatus })
  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.CHECKED_IN,
  })
  status: ReservationStatus;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => AccompanyingGuest, (ag) => ag.reservation, { cascade: true })
  accompanyingGuests: AccompanyingGuest[];
}
