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
import { PrescriptionAiService } from './prescription-ai.service';

@ApiTags('Prescriptions')
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(
    private readonly prescriptionsService: PrescriptionsService,
    private readonly storage: StorageService,
    private readonly ai: PrescriptionAiService,
  ) {}

  // Authenticated upload — links the receta to the logged-in user.
  @Throttle({ default: { ttl: 60000, limit: 20 } })
  @UseGuards(JwtAuthGuard)
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
    return this.uploadInternal(dto, file, user.id);
  }

  // Anonymous upload — used by the guest flow. The returned prescription
  // id is included in the subsequent POST /requests/public payload. Strict
  // rate-limit because there's no auth gate.
  @Throttle({ default: { ttl: 60 * 60 * 1000, limit: 5 } })
  @Post('public')
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
  async createPublic(
    @Body() dto: CreatePrescriptionDto,
    @UploadedFile() file: any,
  ) {
    return this.uploadInternal(dto, file, null);
  }

  private async uploadInternal(
    dto: CreatePrescriptionDto,
    file: any,
    clientId: string | null,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const imageUrl = await this.storage.upload('prescriptions', file.buffer, file.originalname);
    const prescription = await this.prescriptionsService.create(clientId, dto, imageUrl);

    if (file.mimetype.startsWith('image/')) {
      this.ai.analyzeImage(file.buffer, file.mimetype).then((transcription) => {
        if (transcription) {
          this.prescriptionsService.updateTranscription(prescription.id, transcription);
        }
      });
    }

    return prescription;
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  findMine(@CurrentUser() user: any) {
    return this.prescriptionsService.findByClient(user.id);
  }
}
