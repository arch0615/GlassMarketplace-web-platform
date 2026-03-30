import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { MedicosService } from './medicos.service';
import { CreateMedicoDto } from './dto/create-medico.dto';
import { UpdateMedicoDto } from './dto/update-medico.dto';
import { CreateRatingDto } from './dto/create-rating.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Médicos')
@Controller('medicos')
export class MedicosController {
  constructor(private readonly medicosService: MedicosService) {}

  @Get()
  findAll() {
    return this.medicosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicosService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateMedicoDto) {
    return this.medicosService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMedicoDto) {
    return this.medicosService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/profile')
  findMyProfile(@CurrentUser() user: any) {
    return this.medicosService.findByUserId(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/profile')
  updateMyProfile(@CurrentUser() user: any, @Body() dto: UpdateMedicoDto) {
    return this.medicosService.updateByUserId(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/ratings')
  addRating(
    @Param('id') id: string,
    @Body() dto: CreateRatingDto,
    @CurrentUser() user: any,
  ) {
    return this.medicosService.addRating(id, user.id, dto);
  }
}
