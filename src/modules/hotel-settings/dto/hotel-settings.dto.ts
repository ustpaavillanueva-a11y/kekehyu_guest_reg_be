import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PolicyCategory } from '../entities/policy-template.entity';

export class UpdateHotelSettingDto {
  @ApiPropertyOptional({ example: 'Kekehyu Business Hotel' })
  @IsString()
  @IsOptional()
  hotelName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  logoPath?: string;

  @ApiPropertyOptional({ example: '14:00' })
  @IsString()
  @IsOptional()
  defaultCheckInTime?: string;

  @ApiPropertyOptional({ example: '11:00' })
  @IsString()
  @IsOptional()
  defaultCheckOutTime?: string;

  @ApiPropertyOptional({ example: 5000 })
  @IsNumber()
  @IsOptional()
  smokingFee?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsNumber()
  @IsOptional()
  corkageFeePercent?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  contactNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  email?: string;
}

export class CreatePolicyTemplateDto {
  @ApiProperty({ enum: PolicyCategory })
  @IsEnum(PolicyCategory)
  @IsNotEmpty()
  category: PolicyCategory;

  @ApiProperty({ example: 'smoking' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Smoking inside rooms is prohibited. A ₱5,000 smoking fee applies for violations.' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}

export class UpdatePolicyTemplateDto {
  @ApiPropertyOptional({ enum: PolicyCategory })
  @IsEnum(PolicyCategory)
  @IsOptional()
  category?: PolicyCategory;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
