import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('requests')
@UseGuards(JwtAuthGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

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
  findAssigned(@CurrentUser() user: any) {
    // user is the User entity; we need the associated optica
    // The optica lookup by userId is done inside the service via user.id
    return this.requestsService.getForOptica(user.id);
  }
}
