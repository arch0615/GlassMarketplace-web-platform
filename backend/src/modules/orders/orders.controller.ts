import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('cliente')
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: any) {
    return this.ordersService.create(dto, user.id);
  }

  @Get('mine')
  findMine(@CurrentUser() user: any) {
    if (user.role === 'optica') {
      return this.ordersService.findByOptica(user.id);
    }
    return this.ordersService.findByClient(user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @Patch(':id/deliver')
  @UseGuards(RolesGuard)
  @Roles('optica')
  markDelivered(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ordersService.markDelivered(id, user.id);
  }

  @Patch(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles('cliente')
  confirmReceipt(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ordersService.confirmReceipt(id, user.id);
  }
}
