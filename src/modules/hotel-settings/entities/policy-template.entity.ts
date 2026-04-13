import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum PolicyCategory {
  HOUSEKEEPING = 'housekeeping',
  HOTEL = 'hotel',
  DATA_PRIVACY = 'data_privacy',
}

@Entity('policy_templates')
export class PolicyTemplate {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: PolicyCategory })
  @Column({
    type: 'enum',
    enum: PolicyCategory,
  })
  category: PolicyCategory;

  @ApiProperty()
  @Column({ length: 50, unique: true })
  code: string;

  @ApiProperty()
  @Column({ type: 'text' })
  content: string;

  @ApiProperty()
  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @ApiProperty()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
