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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
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

  @Post(':id/upload-pdf')
  @Roles(Role.FRONT_DESK, Role.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('pdf'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        pdf: {
          type: 'string',
          format: 'binary',
          description: 'PDF file to upload',
        },
      },
      required: ['pdf'],
    },
  })
  @ApiOperation({ summary: 'Upload PDF for guest agreement' })
  @ApiResponse({ status: 200, description: 'PDF uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file' })
  @ApiResponse({ status: 404, description: 'Guest not found' })
  async uploadPdf(
    @Param('id', ParseUUIDPipe) guestId: string,
    @UploadedFile() file: multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are allowed');
    }

    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxFileSize) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    return this.guestsService.uploadPdfToStorage(
      guestId,
      file.buffer,
      file.originalname,
    );
  }
}
