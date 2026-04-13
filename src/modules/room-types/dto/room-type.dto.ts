import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoomTypeDto {
  @ApiProperty({ example: 'DELUXE DOUBLE' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: '2 Double Size Bed' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateRoomTypeDto {
  @ApiPropertyOptional({ example: 'DELUXE DOUBLE' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '2 Double Size Bed' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
