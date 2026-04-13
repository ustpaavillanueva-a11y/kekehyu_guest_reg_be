import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class AccompanyingGuestDto {
  @ApiProperty({ example: 'Juan Dela Cruz' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  validIdPresented: boolean;

  @ApiPropertyOptional({ description: 'Base64 encoded signature' })
  @IsString()
  @IsOptional()
  signature?: string;
}

export class ReservationDto {
  @ApiProperty({ example: '8412993383856' })
  @IsString()
  @IsNotEmpty()
  reservationNumber: string;

  @ApiProperty({ example: '408' })
  @IsString()
  @IsNotEmpty()
  roomNumber: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  roomTypeId?: string;

  @ApiProperty({ example: '2026-04-08' })
  @IsDateString()
  @IsNotEmpty()
  checkInDate: string;

  @ApiPropertyOptional({ example: '2026-04-09' })
  @IsDateString()
  @IsOptional()
  checkOutDate?: string;

  @ApiPropertyOptional({ example: '14:00' })
  @IsString()
  @IsOptional()
  checkInTime?: string;

  @ApiPropertyOptional({ example: '11:00' })
  @IsString()
  @IsOptional()
  checkOutTime?: string;

  @ApiPropertyOptional({ type: [AccompanyingGuestDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AccompanyingGuestDto)
  @IsOptional()
  accompanyingGuests?: AccompanyingGuestDto[];
}

export class GuestAgreementDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  policyHousekeeping1: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  policyHousekeeping2: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  policySmoking: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  policyCorkage: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  policyNoPets: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  policyNegligence: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  policyMinors: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  policyParking: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  policySafe: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  policyForceMajeure: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  policyDataPrivacy: boolean;

  @ApiProperty({ example: 'Cherille Antonio' })
  @IsString()
  @IsNotEmpty()
  guestPrintedName: string;

  @ApiProperty({ description: 'Base64 encoded signature' })
  @IsString()
  @IsNotEmpty()
  guestSignature: string;

  @ApiProperty({ example: '2026-04-08' })
  @IsDateString()
  @IsNotEmpty()
  signatureDate: string;

  @ApiProperty({ example: 'Juan Dela Cruz' })
  @IsString()
  @IsNotEmpty()
  processedByName: string;

  @ApiProperty({ description: 'Base64 encoded signature' })
  @IsString()
  @IsNotEmpty()
  processedBySignature: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  remarks?: string;
}

export class CreateGuestDto {
  @ApiProperty({ example: 'Cherille Antonio' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: '0917 826 8950' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'reservations@email.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'Philippines' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  validIdPresented: boolean;

  @ApiPropertyOptional({ example: 'ABC 1234' })
  @IsString()
  @IsOptional()
  vehiclePlateNo?: string;

  @ApiProperty({ type: [ReservationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReservationDto)
  @IsNotEmpty()
  reservations: ReservationDto[];

  @ApiProperty({ type: GuestAgreementDto })
  @ValidateNested()
  @Type(() => GuestAgreementDto)
  @IsNotEmpty()
  agreement: GuestAgreementDto;
}
