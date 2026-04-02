import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { OpticasService } from './opticas.service';
import { CreateOpticaDto } from './dto/create-optica.dto';
import { UpdateOpticaDto } from './dto/update-optica.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Ópticas')
@Controller('opticas')
export class OpticasController {
  constructor(private readonly opticasService: OpticasService) {}

  @Get()
  findAll() {
    return this.opticasService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('optica')
  async findMe(@CurrentUser() user: any) {
    const optica = await this.opticasService.findByUserId(user.id);
    if (!optica) {
      throw new NotFoundException('Optica profile not found');
    }
    return optica;
  }

  @Get('nearby')
  findNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
  ) {
    return this.opticasService.findNearby(
      parseFloat(lat),
      parseFloat(lng),
      radius ? parseFloat(radius) : 10,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.opticasService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateOpticaDto) {
    return this.opticasService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOpticaDto) {
    return this.opticasService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/referral')
  getReferralInfo(@Param('id') id: string) {
    return this.opticasService.getReferralInfo(id);
  }
}
