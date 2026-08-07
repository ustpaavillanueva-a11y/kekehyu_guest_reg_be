import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

@Entity('temp_uploads')
export class TempUpload {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'file_path' })
  filePath: string;

  @ApiProperty()
  @Column({ name: 'file_url' })
  fileUrl: string;

  @ApiProperty()
  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'uploaded_by', nullable: true })
  uploadedById: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'uploaded_by' })
  uploadedBy: User;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty()
  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;
}
