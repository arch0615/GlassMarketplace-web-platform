import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quote } from './quote.entity';
import { QuoteFrame } from './quote-frame.entity';
import { QuoteRequest } from '../requests/quote-request.entity';
import { RequestOptica } from '../requests/request-optica.entity';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
import { OpticasModule } from '../opticas/opticas.module';
import { CatalogModule } from '../catalog/catalog.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quote, QuoteFrame, QuoteRequest, RequestOptica]),
    OpticasModule,
    CatalogModule,
  ],
  controllers: [QuotesController],
  providers: [QuotesService],
  exports: [QuotesService],
})
export class QuotesModule {}
