import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Reservation } from './reservation.entity';
import { GuestAgreement } from './guest-agreement.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('guests')
export class Guest {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
  @Column({ name: 'phone_number', length: 20, nullable: true })
  phoneNumber: string;

  @ApiProperty()
  @Column({ nullable: true })
  email: string;

  @ApiProperty()
  @Column({ length: 100, nullable: true })
  country: string;

  @ApiProperty()
  @Column({ name: 'valid_id_presented', default: false })
  validIdPresented: boolean;

  @ApiProperty()
  @Column({ name: 'vehicle_plate_no', length: 20, nullable: true })
  vehiclePlateNo: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'registered_by' })
  registeredById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'registered_by' })
  registeredBy: User;

  @OneToMany(() => Reservation, (reservation) => reservation.guest, {
    cascade: true,
  })
  reservations: Reservation[];

  @OneToOne(() => GuestAgreement, (agreement) => agreement.guest, {
    cascade: true,
  })
  agreement: GuestAgreement;
}
