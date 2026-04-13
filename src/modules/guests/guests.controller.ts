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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { GuestsService } from './guests.service';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Guests')
@ApiBearerAuth('JWT-auth')
@Controller('guests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GuestsController {
  constructor(private readonly guestsService: GuestsService) {}

  @Post()
  @Roles(Role.FRONT_DESK, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Register a new guest (Front Desk/Super Admin)' })
  @ApiResponse({ status: 201, description: 'Guest registered successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(
    @Body() createGuestDto: CreateGuestDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.guestsService.create(createGuestDto, userId);
  }

  @Get()
  @Roles(Role.FRONT_DESK, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all guests' })
  @ApiResponse({ status: 200, description: 'List of guests' })
  findAll(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.guestsService.findAll(userId, userRole);
  }

  @Get('statistics')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get guest statistics (Admin/Super Admin)' })
  @ApiQuery({
    name: 'period',
    enum: ['today', 'week', 'month', 'year'],
    required: false,
  })
  @ApiResponse({ status: 200, description: 'Guest statistics' })
  getStatistics(
    @Query('period') period: 'today' | 'week' | 'month' | 'year' = 'today',
  ) {
    return this.guestsService.getStatistics(period);
  }

  @Get('period')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get guests for period (Admin/Super Admin)' })
  @ApiQuery({
    name: 'period',
    enum: ['today', 'week', 'month', 'year'],
    required: false,
  })
  @ApiResponse({ status: 200, description: 'Guests for the period' })
  getGuestsForPeriod(
    @Query('period') period: 'today' | 'week' | 'month' | 'year' = 'today',
  ) {
    return this.guestsService.getGuestsForPeriod(period);
  }

  @Get(':id')
  @Roles(Role.FRONT_DESK, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get guest by ID' })
  @ApiResponse({ status: 200, description: 'Guest details' })
  @ApiResponse({ status: 404, description: 'Guest not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.guestsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update guest (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Guest updated' })
  @ApiResponse({ status: 404, description: 'Guest not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateGuestDto: UpdateGuestDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.guestsService.update(id, updateGuestDto, userId, userRole);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete guest (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Guest deleted' })
  @ApiResponse({ status: 404, description: 'Guest not found' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.guestsService.remove(id, userRole);
  }
}
