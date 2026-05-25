import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Throttle } from '@nestjs/throttler';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { CreateAnonymousRequestDto } from './dto/create-anonymous-request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OpticasService } from '../opticas/opticas.service';
import { StorageService } from '../storage/storage.service';
import { ApiTags } from '@nestjs/swagger';

const imageFilter = (_req: any, file: any, cb: any) => {
  if (!file.mimetype.match(/^image\/(jpeg|png|webp|gif)$/)) {
    return cb(new BadRequestException('Solo se permiten imágenes (JPG, PNG, WebP, GIF)'), false);
  }
  cb(null, true);
};

@ApiTags('Requests')
@Controller('requests')
export class RequestsController {
  constructor(
    private readonly requestsService: RequestsService,
    private readonly opticasService: OpticasService,
    private readonly storage: StorageService,
  ) {}

  // ─── Public / anonymous endpoints (no auth) ──────────────────────────

  // Anonymous request creation. Returns the request including its claim
  // token so the frontend can immediately redirect to /presupuesto/:token.
  @Throttle({ default: { ttl: 60 * 60 * 1000, limit: 10 } })
  @Post('public')
  createAnonymous(@Body() dto: CreateAnonymousRequestDto) {
    return this.requestsService.createAnonymous(dto);
  }

  // Token-gated view of an anonymous request — no auth, the token IS the
  // proof of ownership. UUID v4 / 64-char hex is unguessable in practice.
  @Throttle({ default: { ttl: 60000, limit: 30 } })
  @Get('by-token/:token')
  findByToken(@Param('token') token: string) {
    return this.requestsService.findByClaimToken(token);
  }

  // Anonymous arreglo-photo upload, strict rate-limit.
  @Throttle({ default: { ttl: 60 * 60 * 1000, limit: 5 } })
  @Post('upload-photo-public')
  @UseInterceptors(FileInterceptor('image', {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFilter,
  }))
  async uploadPhotoPublic(@UploadedFile() file?: Express.Multer.File) {
    return this.uploadPhotoInternal(file);
  }

  // ─── Authenticated endpoints ─────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cliente')
  @Post('upload-photo')
  @UseInterceptors(FileInterceptor('image', {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFilter,
  }))
  async uploadPhoto(@UploadedFile() file?: Express.Multer.File) {
    return this.uploadPhotoInternal(file);
  }

  private async uploadPhotoInternal(file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se subió ningún archivo.');
    }
    const url = await this.storage.upload('requests', file.buffer, file.originalname);
    return { url };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles('cliente')
  create(@Body() dto: CreateRequestDto, @CurrentUser() user: any) {
    return this.requestsService.create(dto, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('mine')
  @Roles('cliente')
  findMine(@CurrentUser() user: any) {
    return this.requestsService.findByClient(user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('assigned')
  @Roles('optica')
  async findAssigned(@CurrentUser() user: any) {
    const optica = await this.opticasService.findByUserId(user.id);
    if (!optica) {
      throw new NotFoundException('Optica profile not found for this user');
    }
    return this.requestsService.getForOptica(optica.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requestsService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/cancel')
  @Roles('cliente')
  cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.requestsService.cancelByClient(id, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/reject')
  @Roles('optica')
  async reject(@Param('id') id: string, @CurrentUser() user: any) {
    const optica = await this.opticasService.findByUserId(user.id);
    if (!optica) {
      throw new NotFoundException('Optica profile not found');
    }
    return this.requestsService.rejectByOptica(id, optica.id);
  }
}
