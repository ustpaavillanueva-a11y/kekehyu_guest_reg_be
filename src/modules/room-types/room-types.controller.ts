import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RoomTypesService } from './room-types.service';
import { CreateRoomTypeDto, UpdateRoomTypeDto } from './dto/room-type.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Room Types')
@ApiBearerAuth('JWT-auth')
@Controller('room-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoomTypesController {
  constructor(private readonly roomTypesService: RoomTypesService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create room type (Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Room type created' })
  create(@Body() createRoomTypeDto: CreateRoomTypeDto) {
    return this.roomTypesService.create(createRoomTypeDto);
  }

  @Get()
  @Roles(Role.FRONT_DESK, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all room types' })
  @ApiResponse({ status: 200, description: 'List of room types' })
  findAll() {
    return this.roomTypesService.findAll();
  }

  @Get('active')
  @Roles(Role.FRONT_DESK, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get active room types' })
  @ApiResponse({ status: 200, description: 'List of active room types' })
  findAllActive() {
    return this.roomTypesService.findAllActive();
  }

  @Get(':id')
  @Roles(Role.FRONT_DESK, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get room type by ID' })
  @ApiResponse({ status: 200, description: 'Room type details' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.roomTypesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update room type (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Room type updated' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoomTypeDto: UpdateRoomTypeDto,
  ) {
    return this.roomTypesService.update(id, updateRoomTypeDto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete room type (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Room type deleted' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.roomTypesService.remove(id);
  }

  @Post('seed')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Seed default room types (Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Default room types seeded' })
  seed() {
    return this.roomTypesService.seedDefaultRoomTypes();
  }
}
