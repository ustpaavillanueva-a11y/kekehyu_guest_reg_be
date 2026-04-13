import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Guest } from './guest.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('guest_agreements')
export class GuestAgreement {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'guest_id', unique: true })
  guestId: string;

  @OneToOne(() => Guest, (guest) => guest.agreement, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guest_id' })
  guest: Guest;

  // Housekeeping policies
  @ApiProperty()
  @Column({ name: 'policy_housekeeping_1', default: false })
  policyHousekeeping1: boolean;

  @ApiProperty()
  @Column({ name: 'policy_housekeeping_2', default: false })
  policyHousekeeping2: boolean;

  // Hotel policies
  @ApiProperty()
  @Column({ name: 'policy_smoking', default: false })
  policySmoking: boolean;

  @ApiProperty()
  @Column({ name: 'policy_corkage', default: false })
  policyCorkage: boolean;

  @ApiProperty()
  @Column({ name: 'policy_no_pets', default: false })
  policyNoPets: boolean;

  @ApiProperty()
  @Column({ name: 'policy_negligence', default: false })
  policyNegligence: boolean;

  @ApiProperty()
  @Column({ name: 'policy_minors', default: false })
  policyMinors: boolean;

  @ApiProperty()
  @Column({ name: 'policy_parking', default: false })
  policyParking: boolean;

  @ApiProperty()
  @Column({ name: 'policy_safe', default: false })
  policySafe: boolean;

  @ApiProperty()
  @Column({ name: 'policy_force_majeure', default: false })
  policyForceMajeure: boolean;

  @ApiProperty()
  @Column({ name: 'policy_data_privacy', default: false })
  policyDataPrivacy: boolean;

  // Guest signature
  @ApiProperty()
  @Column({ name: 'guest_printed_name', length: 200 })
  guestPrintedName: string;

  @ApiProperty()
  @Column({ name: 'guest_signature', type: 'text' })
  guestSignature: string;

  @ApiProperty()
  @Column({ name: 'signature_date', type: 'date' })
  signatureDate: Date;

  // Front desk
  @ApiProperty()
  @Column({ name: 'processed_by_name', length: 200 })
  processedByName: string;

  @ApiProperty()
  @Column({ name: 'processed_by_signature', type: 'text' })
  processedBySignature: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  remarks: string;

  @ApiProperty()
  @Column({ name: 'pdf_path', length: 500, nullable: true })
  pdfPath: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
