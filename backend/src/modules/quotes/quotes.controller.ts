import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags } from '@nestjs/swagger';
import { RequestsService } from '../requests/requests.service';

@ApiTags('Quotes')
@Controller('quotes')
export class QuotesController {
  constructor(
    private readonly quotesService: QuotesService,
    private readonly requestsService: RequestsService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('optica')
  @Post()
  create(@Body() dto: CreateQuoteDto) {
    return this.quotesService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('optica')
  @Get('mine')
  findMine(@CurrentUser() user: any) {
    return this.quotesService.findByOptica(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('request/:requestId')
  findByRequest(@Param('requestId') requestId: string) {
    return this.quotesService.findByRequest(requestId);
  }

  // Token-gated public read for guests viewing their quotes pre-claim.
  @Throttle({ default: { ttl: 60000, limit: 30 } })
  @Get('by-request-token/:token')
  async findByRequestToken(@Param('token') token: string) {
    const request = await this.requestsService.findByClaimToken(token);
    return this.quotesService.findByRequest(request.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotesService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cliente')
  @Patch(':id/accept')
  accept(@Param('id') id: string, @Body() body: { tier?: string }, @CurrentUser() user: any) {
    return this.quotesService.accept(id, user.id, body?.tier);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cliente')
  @Patch(':id/reject')
  reject(@Param('id') id: string, @CurrentUser() user: any) {
    return this.quotesService.reject(id, user.id);
  }
}
