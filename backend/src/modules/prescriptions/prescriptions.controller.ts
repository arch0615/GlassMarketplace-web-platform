import {
  Controller,
  Post,
  Get,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags } from '@nestjs/swagger';
import { StorageService } from '../storage/storage.service';

@ApiTags('Prescriptions')
@Controller('prescriptions')
@UseGuards(JwtAuthGuard)
export class PrescriptionsController {
  constructor(
    private readonly prescriptionsService: PrescriptionsService,
    private readonly storage: StorageService,
  ) {}

  @Throttle({ default: { ttl: 60000, limit: 20 } })
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|webp|gif)$/) && file.mimetype !== 'application/pdf') {
          return cb(new BadRequestException('Solo se permiten imágenes (JPG, PNG, WebP, GIF) o PDF'), false);
        }
        cb(null, true);
      },
    }),
  )
  async create(
    @Body() dto: CreatePrescriptionDto,
    @UploadedFile() file: any,
    @CurrentUser() user: any,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const imageUrl = await this.storage.upload('prescriptions', file.buffer, file.originalname);

    return this.prescriptionsService.create(user.id, dto, imageUrl);
  }

  @Get('mine')
  findMine(@CurrentUser() user: any) {
    return this.prescriptionsService.findByClient(user.id);
  }
}
