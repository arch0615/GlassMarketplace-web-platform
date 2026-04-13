import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags } from '@nestjs/swagger';
import { StorageService } from '../storage/storage.service';

const imageFilter = (_req: any, file: any, cb: any) => {
  if (!file.mimetype.match(/^image\/(jpeg|png|webp|gif)$/)) {
    return cb(new Error('Solo se permiten imágenes (JPG, PNG, WebP, GIF)'), false);
  }
  cb(null, true);
};

@ApiTags('Disputes')
@Controller('disputes')
@UseGuards(JwtAuthGuard)
export class DisputesController {
  constructor(
    private readonly disputesService: DisputesService,
    private readonly storage: StorageService,
  ) {}

  @Throttle({ default: { ttl: 60000, limit: 20 } })
  @Post()
  @UseGuards(RolesGuard)
  @Roles('cliente')
  @UseInterceptors(FilesInterceptor('photos', 5, {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFilter,
  }))
  async create(
    @Body() dto: CreateDisputeDto,
    @CurrentUser() user: any,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const photoUrls: string[] = [];
    if (files?.length) {
      for (const file of files) {
        const url = await this.storage.upload('disputes', file.buffer, file.originalname);
        photoUrls.push(url);
      }
    }
    return this.disputesService.create(dto, user.id, photoUrls);
  }

  @Get('mine')
  findMine(@CurrentUser() user: any) {
    return this.disputesService.findByUser(user.id);
  }

  @Get('by-order/:orderId')
  findByOrder(@Param('orderId') orderId: string) {
    return this.disputesService.findByOrderId(orderId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.disputesService.findById(id);
  }

  @Post(':id/messages')
  addMessage(
    @Param('id') id: string,
    @Body() dto: AddMessageDto,
    @CurrentUser() user: any,
  ) {
    return this.disputesService.addMessage(id, user.id, dto);
  }

  @Patch(':id/resolve')
  @UseGuards(RolesGuard)
  @Roles('admin')
  resolve(@Param('id') id: string, @Body() dto: ResolveDisputeDto) {
    return this.disputesService.resolve(id, dto);
  }

  @Patch(':id/mark-corrected')
  @UseGuards(RolesGuard)
  @Roles('optica')
  markCorrected(@Param('id') id: string, @CurrentUser() user: any) {
    return this.disputesService.markCorrected(id, user.id);
  }

  @Patch(':id/confirm-correction')
  @UseGuards(RolesGuard)
  @Roles('cliente')
  confirmCorrection(@Param('id') id: string, @CurrentUser() user: any) {
    return this.disputesService.confirmCorrection(id, user.id);
  }

  @Patch(':id/reject-correction')
  @UseGuards(RolesGuard)
  @Roles('cliente')
  rejectCorrection(@Param('id') id: string, @Body() body: { reason?: string }, @CurrentUser() user: any) {
    return this.disputesService.rejectCorrection(id, user.id, body?.reason || '');
  }
}
