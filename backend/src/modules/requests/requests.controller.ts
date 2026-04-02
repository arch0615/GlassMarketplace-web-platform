import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OpticasService } from '../opticas/opticas.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Requests')
@Controller('requests')
@UseGuards(JwtAuthGuard)
export class RequestsController {
  constructor(
    private readonly requestsService: RequestsService,
    private readonly opticasService: OpticasService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('cliente')
  create(@Body() dto: CreateRequestDto, @CurrentUser() user: any) {
    return this.requestsService.create(dto, user.id);
  }

  @Get('mine')
  @UseGuards(RolesGuard)
  @Roles('cliente')
  findMine(@CurrentUser() user: any) {
    return this.requestsService.findByClient(user.id);
  }

  @Get('assigned')
  @UseGuards(RolesGuard)
  @Roles('optica')
  async findAssigned(@CurrentUser() user: any) {
    const optica = await this.opticasService.findByUserId(user.id);
    if (!optica) {
      throw new NotFoundException('Optica profile not found for this user');
    }
    return this.requestsService.getForOptica(optica.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requestsService.findById(id);
  }
}
