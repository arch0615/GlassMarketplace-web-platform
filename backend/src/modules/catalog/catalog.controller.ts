import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CreateFrameDto } from './dto/create-frame.dto';
import { UpdateFrameDto } from './dto/update-frame.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

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
  create(@Body() dto: CreateFrameDto) {
    return this.catalogService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('optica', 'admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFrameDto) {
    return this.catalogService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('optica', 'admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.catalogService.remove(id);
  }
}
