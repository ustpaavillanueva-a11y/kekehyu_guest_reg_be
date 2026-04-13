import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('user_sessions')
export class UserSession {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty()
  @Column({ name: 'login_at', type: 'timestamp' })
  loginAt: Date;

  @ApiProperty()
  @Column({ name: 'logout_at', type: 'timestamp', nullable: true })
  logoutAt: Date;

  @ApiProperty()
  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @ApiProperty()
  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @ApiProperty()
  @Column({ name: 'duration_minutes', nullable: true })
  durationMinutes: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
