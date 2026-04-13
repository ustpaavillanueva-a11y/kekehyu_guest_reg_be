import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Reservation } from './reservation.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @ApiProperty()
  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @ApiPropertyOptional()
  @Column({ name: 'middle_name', length: 100, nullable: true })
  middleName: string;

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
