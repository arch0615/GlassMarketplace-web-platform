import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Quotes')
@Controller('quotes')
@UseGuards(JwtAuthGuard)
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('optica')
  create(@Body() dto: CreateQuoteDto) {
    return this.quotesService.create(dto);
  }

  @Get('mine')
  @UseGuards(RolesGuard)
  @Roles('optica')
  findMine(@CurrentUser() user: any) {
    return this.quotesService.findByOptica(user.id);
  }

  @Get('request/:requestId')
  findByRequest(@Param('requestId') requestId: string) {
    return this.quotesService.findByRequest(requestId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotesService.findById(id);
  }

  @Patch(':id/accept')
  @UseGuards(RolesGuard)
  @Roles('cliente')
  accept(@Param('id') id: string, @CurrentUser() user: any) {
    return this.quotesService.accept(id, user.id);
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles('cliente')
  reject(@Param('id') id: string, @CurrentUser() user: any) {
    return this.quotesService.reject(id, user.id);
  }
}
