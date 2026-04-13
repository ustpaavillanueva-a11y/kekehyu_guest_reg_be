import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Sessions')
@ApiBearerAuth('JWT-auth')
@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get('front-desk-activity')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get front desk activity (Admin/Super Admin)' })
  @ApiQuery({
    name: 'period',
    enum: ['today', 'week', 'month', 'year'],
    required: false,
  })
  @ApiResponse({ status: 200, description: 'Front desk activity data' })
  getFrontDeskActivity(
    @Query('period') period: 'today' | 'week' | 'month' | 'year' = 'today',
  ) {
    return this.sessionsService.getFrontDeskActivity(period);
  }

  @Get('all')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all sessions for period (Admin/Super Admin)' })
  @ApiQuery({
    name: 'period',
    enum: ['today', 'week', 'month', 'year'],
    required: false,
  })
  @ApiResponse({ status: 200, description: 'All sessions' })
  getAllSessions(
    @Query('period') period: 'today' | 'week' | 'month' | 'year' = 'today',
  ) {
    return this.sessionsService.getAllSessionsForPeriod(period);
  }
}
