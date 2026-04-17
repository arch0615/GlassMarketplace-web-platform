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
    let optica = await this.opticasService.findByUserId(user.id);
    if (!optica) {
      // Auto-create optica profile for users that registered without one
      optica = await this.opticasService.create({
        userId: user.id,
        businessName: user.fullName || 'Mi Óptica',
        phone: user.phone,
      });
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

  @Get('search')
  search(@Query('q') query: string) {
    if (!query || query.length < 2) return [];
    return this.opticasService.search(query);
  }

  @Get('geocode')
  async geocode(@Query('q') query: string) {
    if (!query || query.length < 2) return null;
    return this.opticasService.geocodeAddress(query);
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
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOpticaDto,
    @CurrentUser() user: any,
  ) {
    // Only the óptica owner (or admin) can modify their record.
    if (user.role !== 'admin') {
      const optica = await this.opticasService.findById(id);
      if (!optica || optica.user?.id !== user.id) {
        throw new NotFoundException('Óptica no encontrada');
      }
    }
    return this.opticasService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/referral')
  getReferralInfo(@Param('id') id: string) {
    return this.opticasService.getReferralInfo(id);
  }

  @Get(':id/ratings')
  getRatings(@Param('id') id: string) {
    return this.opticasService.getRatings(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/ratings')
  addRating(
    @Param('id') id: string,
    @Body() body: { score: number; comment?: string; orderId: string },
    @CurrentUser() user: any,
  ) {
    return this.opticasService.addRating(id, user.id, body.orderId, body.score, body.comment);
  }
}
