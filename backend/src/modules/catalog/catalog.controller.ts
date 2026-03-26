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
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { CatalogService } from './catalog.service';
import { CreateFrameDto } from './dto/create-frame.dto';
import { UpdateFrameDto } from './dto/update-frame.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

const UPLOAD_DIR = './uploads/catalog';
mkdirSync(UPLOAD_DIR, { recursive: true });

const imageStorage = diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const imageFilter = (_req: any, file: any, cb: any) => {
  if (!file.mimetype.match(/^image\/(jpeg|png|webp|gif)$/)) {
    return cb(new Error('Solo se permiten imágenes (JPG, PNG, WebP, GIF)'), false);
  }
  cb(null, true);
};

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('optica/:opticaId')
  findByOptica(@Param('opticaId') opticaId: string) {
    return this.catalogService.findByOptica(opticaId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('optica', 'admin')
  @Post()
  @UseInterceptors(FileInterceptor('image', {
    storage: imageStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFilter,
  }))
  create(@Body() dto: CreateFrameDto, @UploadedFile() file?: Express.Multer.File) {
    if (file) {
      dto.imageUrl = `/uploads/catalog/${file.filename}`;
    }
    return this.catalogService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('optica', 'admin')
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', {
    storage: imageStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFilter,
  }))
  update(@Param('id') id: string, @Body() dto: UpdateFrameDto, @UploadedFile() file?: Express.Multer.File) {
    if (file) {
      dto.imageUrl = `/uploads/catalog/${file.filename}`;
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
