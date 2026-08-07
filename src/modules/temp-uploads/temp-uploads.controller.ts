import {
  Controller,
  Get,
  Post,
  UseGuards,
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
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { TempUploadsService } from './temp-uploads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

@ApiTags('Temp Uploads')
@ApiBearerAuth('JWT-auth')
@Controller('temp-uploads')
@UseGuards(JwtAuthGuard)
export class TempUploadsController {
  constructor(private readonly tempUploadsService: TempUploadsService) {}

  @Get()
  @ApiOperation({ summary: 'List all active (not yet expired) temp uploads' })
  @ApiResponse({ status: 200, description: 'List of active temp uploads' })
  findAllActive() {
    return this.tempUploadsService.findAllActive();
  }

  @Post()
  @UseInterceptors(FileInterceptor('pdf'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        pdf: {
          type: 'string',
          format: 'binary',
          description: 'PDF file to upload, auto-deleted after 1 hour',
        },
      },
      required: ['pdf'],
    },
  })
  @ApiOperation({ summary: 'Upload a temporary PDF (auto-deleted after 1 hour)' })
  @ApiResponse({ status: 201, description: 'PDF uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file' })
  async upload(
    @UploadedFile() file: multer.File,
    @CurrentUser() currentUser: User,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are allowed');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    return this.tempUploadsService.upload(
      file.buffer,
      file.originalname,
      currentUser.id,
    );
  }
}
