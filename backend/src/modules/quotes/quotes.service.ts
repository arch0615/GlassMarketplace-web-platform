import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Quote } from './quote.entity';
import { QuoteFrame } from './quote-frame.entity';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { OpticasService } from '../opticas/opticas.service';
import { CatalogService } from '../catalog/catalog.service';
import { NotificationsService } from '../notifications/notifications.service';
import { QuoteRequest } from '../requests/quote-request.entity';
import { RequestOptica } from '../requests/request-optica.entity';

@Injectable()
export class QuotesService {
  private readonly logger = new Logger(QuotesService.name);

  constructor(
    @InjectRepository(Quote)
    private readonly quotesRepository: Repository<Quote>,
    @InjectRepository(QuoteFrame)
    private readonly quoteFramesRepository: Repository<QuoteFrame>,
    @InjectRepository(QuoteRequest)
    private readonly requestsRepository: Repository<QuoteRequest>,
    @InjectRepository(RequestOptica)
    private readonly requestOpticaRepository: Repository<RequestOptica>,
    private readonly opticasService: OpticasService,
    private readonly catalogService: CatalogService,
    private readonly notificationsService: NotificationsService,
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

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Use recommended price as the display totalPrice, fallback to basic or explicit
    const totalPrice = dto.totalPrice
      || dto.tierRecommendedPrice
      || dto.tierBasicPrice
      || 0;

    const quote = this.quotesRepository.create({
      request,
      optica,
      totalPrice,
      lensDescription: dto.lensDescription,
      estimatedDays: dto.estimatedDays,
      tierBasicPrice: dto.tierBasicPrice,
      tierBasicDesc: dto.tierBasicDesc,
      tierRecommendedPrice: dto.tierRecommendedPrice,
      tierRecommendedDesc: dto.tierRecommendedDesc,
      tierPremiumPrice: dto.tierPremiumPrice,
      tierPremiumDesc: dto.tierPremiumDesc,
      expiresAt,
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

    // Mark this optica's request assignment as responded
    await this.requestOpticaRepository
      .createQueryBuilder()
      .update(RequestOptica)
      .set({ status: 'responded' as any })
      .where('"requestId" = :requestId AND "opticaId" = :opticaId', {
        requestId: request.id,
        opticaId: dto.opticaId,
      })
      .execute();

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

  async accept(quoteId: string, clientId: string, tier?: string): Promise<Quote> {
    const quote = await this.findById(quoteId);

    if (quote.request.client.id !== clientId) {
      throw new BadRequestException('You can only accept quotes for your own requests');
    }
    if (quote.status !== 'pending') {
      throw new BadRequestException('Quote is no longer in pending status');
    }
    if (quote.request.status === 'expired') {
      throw new BadRequestException('This quote request has expired and quotes can no longer be accepted');
    }
    if (quote.expiresAt && new Date() > new Date(quote.expiresAt)) {
      await this.quotesRepository.update(quoteId, { status: 'expired' });
      throw new BadRequestException('Este presupuesto ha vencido (24 hs)');
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

    // Resolve final price from selected tier
    const updateData: any = { status: 'accepted' };
    if (tier) {
      updateData.selectedTier = tier;
      if (tier === 'basica' && quote.tierBasicPrice) {
        updateData.totalPrice = quote.tierBasicPrice;
      } else if (tier === 'recomendada' && quote.tierRecommendedPrice) {
        updateData.totalPrice = quote.tierRecommendedPrice;
      } else if (tier === 'premium' && quote.tierPremiumPrice) {
        updateData.totalPrice = quote.tierPremiumPrice;
      }
    }
    await this.quotesRepository.update(quoteId, updateData);

    // Mark request as filled
    await this.requestsRepository.update(quote.request.id, { status: 'filled' });

    // Notify optica that their quote was accepted (best-effort, background)
    const opticaEmail = quote.optica?.user?.email;
    if (opticaEmail) {
      this.notificationsService.sendEmail(
        opticaEmail,
        'Lensia — ¡Tu presupuesto fue aceptado!',
        `<div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #1E40AF; margin-bottom: 16px;">Lensia</h2>
          <p>¡Buenas noticias! Un cliente aceptó tu presupuesto.</p>
          <div style="background: #ECFDF5; border-radius: 8px; padding: 12px 16px; margin: 16px 0; font-size: 16px; font-weight: 600; color: #059669;">
            Presupuesto aceptado — $${Number(quote.totalPrice).toLocaleString('es-AR')}
          </div>
          <p style="color: #64748B; font-size: 14px;">Ingresá a tu panel para ver los detalles del pedido.</p>
        </div>`,
      ).catch((err) => this.logger.warn(`Failed to notify optica: ${err.message}`));
    }

    return this.findById(quoteId);
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async expireQuotes(): Promise<void> {
    const expired = await this.quotesRepository.find({
      where: {
        status: 'pending',
        expiresAt: LessThan(new Date()),
      },
    });

    if (expired.length > 0) {
      this.logger.log(`[Cron] Expiring ${expired.length} quotes past 24h deadline`);
      for (const quote of expired) {
        await this.quotesRepository.update(quote.id, { status: 'expired' });
      }
    }
  }
}
