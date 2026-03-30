import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CatalogService } from './catalog.service';
import { CreateFrameDto } from './dto/create-frame.dto';
import { UpdateFrameDto } from './dto/update-frame.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiTags } from '@nestjs/swagger';
import { StorageService } from '../storage/storage.service';

const imageFilter = (_req: any, file: any, cb: any) => {
  if (!file.mimetype.match(/^image\/(jpeg|png|webp|gif)$/)) {
    return cb(new Error('Solo se permiten imágenes (JPG, PNG, WebP, GIF)'), false);
  }
  cb(null, true);
};

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly storage: StorageService,
  ) {}

  @Get('optica/:opticaId')
  findByOptica(@Param('opticaId') opticaId: string) {
    return this.catalogService.findByOptica(opticaId);
  }

  @Throttle({ default: { ttl: 60000, limit: 20 } })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('optica', 'admin')
  @Post()
  @UseInterceptors(FileInterceptor('image', {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFilter,
  }))
  async create(@Body() dto: CreateFrameDto, @UploadedFile() file?: Express.Multer.File) {
    if (file) {
      dto.imageUrl = await this.storage.upload('catalog', file.buffer, file.originalname);
    }
    return this.catalogService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('optica', 'admin')
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFilter,
  }))
  async update(@Param('id') id: string, @Body() dto: UpdateFrameDto, @UploadedFile() file?: Express.Multer.File) {
    if (file) {
      dto.imageUrl = await this.storage.upload('catalog', file.buffer, file.originalname);
    }
    return this.catalogService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('optica', 'admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.catalogService.remove(id);
  }
}
