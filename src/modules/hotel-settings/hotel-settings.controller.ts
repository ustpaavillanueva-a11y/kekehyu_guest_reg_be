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
import { HotelSettingsService } from './hotel-settings.service';
import {
  UpdateHotelSettingDto,
  CreatePolicyTemplateDto,
  UpdatePolicyTemplateDto,
} from './dto/hotel-settings.dto';
import { PolicyCategory } from './entities/policy-template.entity';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Hotel Settings')
@ApiBearerAuth('JWT-auth')
@Controller('hotel-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HotelSettingsController {
  constructor(private readonly hotelSettingsService: HotelSettingsService) {}

  // Hotel Settings
  @Get()
  @Roles(Role.FRONT_DESK, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get hotel settings' })
  @ApiResponse({ status: 200, description: 'Hotel settings' })
  getSettings() {
    return this.hotelSettingsService.getSettings();
  }

  @Patch()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update hotel settings (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Settings updated' })
  updateSettings(
    @Body() updateDto: UpdateHotelSettingDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.hotelSettingsService.updateSettings(updateDto, userId);
  }

  // Policy Templates
  @Get('policies')
  @Roles(Role.FRONT_DESK, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all policy templates' })
  @ApiResponse({ status: 200, description: 'List of policies' })
  getAllPolicies() {
    return this.hotelSettingsService.getAllPolicies();
  }

  @Get('policies/active')
  @Roles(Role.FRONT_DESK, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get active policy templates' })
  @ApiResponse({ status: 200, description: 'List of active policies' })
  getActivePolicies() {
    return this.hotelSettingsService.getActivePolicies();
  }

  @Get('policies/category')
  @Roles(Role.FRONT_DESK, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get policies by category' })
  @ApiQuery({ name: 'category', enum: PolicyCategory })
  @ApiResponse({ status: 200, description: 'Policies by category' })
  getPoliciesByCategory(@Query('category') category: PolicyCategory) {
    return this.hotelSettingsService.getPoliciesByCategory(category);
  }

  @Post('policies')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create policy template (Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Policy created' })
  createPolicy(@Body() createDto: CreatePolicyTemplateDto) {
    return this.hotelSettingsService.createPolicy(createDto);
  }

  @Get('policies/:id')
  @Roles(Role.FRONT_DESK, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get policy by ID' })
  @ApiResponse({ status: 200, description: 'Policy details' })
  getPolicy(@Param('id', ParseUUIDPipe) id: string) {
    return this.hotelSettingsService.getPolicy(id);
  }

  @Patch('policies/:id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update policy (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Policy updated' })
  updatePolicy(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePolicyTemplateDto,
  ) {
    return this.hotelSettingsService.updatePolicy(id, updateDto);
  }

  @Delete('policies/:id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete policy (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Policy deleted' })
  deletePolicy(@Param('id', ParseUUIDPipe) id: string) {
    return this.hotelSettingsService.deletePolicy(id);
  }

  @Post('policies/seed')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Seed default policies (Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Default policies seeded' })
  seedPolicies() {
    return this.hotelSettingsService.seedDefaultPolicies();
  }
}
