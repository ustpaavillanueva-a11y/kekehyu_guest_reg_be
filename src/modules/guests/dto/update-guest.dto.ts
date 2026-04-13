import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateGuestDto {
  @ApiPropertyOptional({ example: 'Cherille Antonio' })
  @IsString()
  @IsOptional()
  name?: string;

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

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  validIdPresented?: boolean;

  @ApiPropertyOptional({ example: 'ABC 1234' })
  @IsString()
  @IsOptional()
  vehiclePlateNo?: string;
}
