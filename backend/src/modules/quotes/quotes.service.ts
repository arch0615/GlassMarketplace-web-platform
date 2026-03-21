import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quote } from './quote.entity';
import { QuoteFrame } from './quote-frame.entity';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { OpticasService } from '../opticas/opticas.service';
import { CatalogService } from '../catalog/catalog.service';
import { InjectRepository as IR } from '@nestjs/typeorm';
import { QuoteRequest } from '../requests/quote-request.entity';

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote)
    private readonly quotesRepository: Repository<Quote>,
    @InjectRepository(QuoteFrame)
    private readonly quoteFramesRepository: Repository<QuoteFrame>,
    @InjectRepository(QuoteRequest)
    private readonly requestsRepository: Repository<QuoteRequest>,
    private readonly opticasService: OpticasService,
    private readonly catalogService: CatalogService,
  ) {}

  async create(dto: CreateQuoteDto): Promise<Quote> {
    const request = await this.requestsRepository.findOne({ where: { id: dto.requestId } });
    if (!request) {
      throw new NotFoundException(`QuoteRequest ${dto.requestId} not found`);
    }
    if (request.status !== 'open') {
      throw new BadRequestException('Quote request is no longer open');
    }

    const optica = await this.opticasService.findById(dto.opticaId);

    const quote = this.quotesRepository.create({
      request,
      optica,
      totalPrice: dto.totalPrice,
      lensDescription: dto.lensDescription,
      estimatedDays: dto.estimatedDays,
    });
    const savedQuote = await this.quotesRepository.save(quote);

    // Attach frames (up to 5)
    if (dto.frameIds && dto.frameIds.length > 0) {
      for (const frameId of dto.frameIds.slice(0, 5)) {
        const frame = await this.catalogService.findById(frameId);
        const qf = this.quoteFramesRepository.create({ quote: savedQuote, frame });
        await this.quoteFramesRepository.save(qf);
      }
    }

    // Update request quotes received count
    await this.requestsRepository.update(request.id, {
      quotesReceived: request.quotesReceived + 1,
    });

    return this.findById(savedQuote.id);
  }

  async findById(id: string): Promise<Quote> {
    const quote = await this.quotesRepository.findOne({ where: { id } });
    if (!quote) {
      throw new NotFoundException(`Quote with id ${id} not found`);
    }
    return quote;
  }

  async findByRequest(requestId: string): Promise<Quote[]> {
    return this.quotesRepository.find({
      where: { request: { id: requestId } },
      order: { createdAt: 'ASC' },
    });
  }

  async findByOptica(opticaUserId: string): Promise<Quote[]> {
    return this.quotesRepository.find({
      where: { optica: { user: { id: opticaUserId } } },
      order: { createdAt: 'DESC' },
    });
  }

  async reject(quoteId: string, clientId: string): Promise<Quote> {
    const quote = await this.findById(quoteId);

    if (quote.request.client.id !== clientId) {
      throw new BadRequestException('You can only reject quotes for your own requests');
    }
    if (quote.status !== 'pending') {
      throw new BadRequestException('Quote is no longer in pending status');
    }

    await this.quotesRepository.update(quoteId, { status: 'rejected' });
    return this.findById(quoteId);
  }

  async accept(quoteId: string, clientId: string): Promise<Quote> {
    const quote = await this.findById(quoteId);

    if (quote.request.client.id !== clientId) {
      throw new BadRequestException('You can only accept quotes for your own requests');
    }
    if (quote.status !== 'pending') {
      throw new BadRequestException('Quote is no longer in pending status');
    }

    // Reject all other quotes for same request
    await this.quotesRepository
      .createQueryBuilder()
      .update(Quote)
      .set({ status: 'rejected' })
      .where('requestId = :requestId AND id != :quoteId', {
        requestId: quote.request.id,
        quoteId,
      })
      .execute();

    // Accept this quote
    await this.quotesRepository.update(quoteId, { status: 'accepted' });

    // Mark request as filled
    await this.requestsRepository.update(quote.request.id, { status: 'filled' });

    return this.findById(quoteId);
  }
}
