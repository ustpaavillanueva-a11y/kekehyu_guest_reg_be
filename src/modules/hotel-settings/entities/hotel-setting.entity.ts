import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('hotel_settings')
export class HotelSetting {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'hotel_name', default: 'Kekehyu Business Hotel' })
  hotelName: string;

  @ApiProperty()
  @Column({ name: 'logo_path', length: 500, nullable: true })
  logoPath: string;

  @ApiProperty()
  @Column({ name: 'default_check_in_time', type: 'time', default: '14:00' })
  defaultCheckInTime: string;

  @ApiProperty()
  @Column({ name: 'default_check_out_time', type: 'time', default: '11:00' })
  defaultCheckOutTime: string;

  @ApiProperty()
  @Column({
    name: 'smoking_fee',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 5000,
  })
  smokingFee: number;

  @ApiProperty()
  @Column({ name: 'corkage_fee_percent', default: 30 })
  corkageFeePercent: number;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  address: string;

  @ApiProperty()
  @Column({ name: 'contact_number', length: 50, nullable: true })
  contactNumber: string;

  @ApiProperty()
  @Column({ nullable: true })
  email: string;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'updated_by', nullable: true })
  updatedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy: User;
}
