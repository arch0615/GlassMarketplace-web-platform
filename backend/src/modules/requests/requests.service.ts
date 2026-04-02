import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QuoteRequest } from './quote-request.entity';
import { RequestOptica } from './request-optica.entity';
import { Quote } from '../quotes/quote.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { UsersService } from '../users/users.service';
import { OpticasService } from '../opticas/opticas.service';
import { PrescriptionsService } from '../prescriptions/prescriptions.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SettingsService } from '../settings/settings.service';
import { Optica } from '../opticas/optica.entity';

@Injectable()
export class RequestsService {
  private readonly logger = new Logger(RequestsService.name);

  constructor(
    @InjectRepository(QuoteRequest)
    private readonly requestsRepository: Repository<QuoteRequest>,
    @InjectRepository(RequestOptica)
    private readonly requestOpticaRepository: Repository<RequestOptica>,
    @InjectRepository(Quote)
    private readonly quotesRepository: Repository<Quote>,
    private readonly usersService: UsersService,
    private readonly opticasService: OpticasService,
    private readonly prescriptionsService: PrescriptionsService,
    private readonly notificationsService: NotificationsService,
    private readonly settingsService: SettingsService,
  ) {}

  async create(dto: CreateRequestDto, clientId: string): Promise<QuoteRequest> {
    const client = await this.usersService.findById(clientId);

    const expiryHours = parseInt(
      (await this.settingsService.get('quote_expiry_hours')) || '48',
      10,
    );
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

    let prescription = null;
    if (dto.prescriptionId) {
      prescription = await this.prescriptionsService.findById(dto.prescriptionId);
    }

    const request = this.requestsRepository.create({
      client,
      prescription,
      lensType: dto.lensType,
      priceRangeMin: dto.priceRangeMin,
      priceRangeMax: dto.priceRangeMax,
      stylePreferences: dto.stylePreferences,
      clientLat: dto.clientLat,
      clientLng: dto.clientLng,
      expiresAt,
    });

    const savedRequest = await this.requestsRepository.save(request);

    // Smart selection: find nearby opticas and score them
    const radiusKm = parseInt(
      (await this.settingsService.get('outer_radius_km')) || '10',
      10,
    );
    const maxSelect = parseInt(
      (await this.settingsService.get('smart_select_max')) || '5',
      10,
    );
    const minSelect = parseInt(
      (await this.settingsService.get('smart_select_min')) || '3',
      10,
    );

    let nearbyOpticas = await this.opticasService.findNearby(
      dto.clientLat,
      dto.clientLng,
      radiusKm,
    );

    // Fallback: if no nearby opticas found (e.g. none have coordinates),
    // send to all approved opticas so requests don't go unanswered
    if (nearbyOpticas.length === 0) {
      this.logger.warn(
        `No nearby opticas found within ${radiusKm}km. Falling back to all opticas.`,
      );
      nearbyOpticas = await this.opticasService.findAll();
    }

    const scored = this.scoreOpticas(nearbyOpticas, dto.clientLat, dto.clientLng, radiusKm);
    const selected = scored.slice(0, Math.max(maxSelect, minSelect));

    for (const optica of selected) {
      const junction = this.requestOpticaRepository.create({
        request: savedRequest,
        optica,
        status: 'pending',
      });
      await this.requestOpticaRepository.save(junction);

      // Notify optica (best-effort)
      if (optica.user?.email) {
        await this.notificationsService.notifyOpticaNewRequest(
          optica.user.email,
          savedRequest.id,
        );
      }

      // Increment optica's request count
      await this.opticasService.update(optica.id, {
        totalRequestCount: optica.totalRequestCount + 1,
      } as any);
    }

    return savedRequest;
  }

  private scoreOpticas(opticas: Optica[], clientLat: number, clientLng: number, maxDist: number): Optica[] {
    const tierBoost: Record<string, number> = { free: 0, pro: 5, premium: 10 };

    return opticas
      .map((o) => {
        const dist = this.haversine(clientLat, clientLng, Number(o.lat), Number(o.lng));
        const distScore = Math.max(0, 100 - (dist / maxDist) * 100);
        const responseScore = Number(o.responseRate) * 20;
        const tierScore = tierBoost[o.subscriptionTier] || 0;
        const score = distScore + responseScore + tierScore;
        return { optica: o, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((x) => x.optica);
  }

  private haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  async findById(id: string): Promise<QuoteRequest> {
    const request = await this.requestsRepository.findOne({ where: { id } });
    if (!request) {
      throw new NotFoundException(`QuoteRequest with id ${id} not found`);
    }
    return request;
  }

  async findAll(status?: string): Promise<QuoteRequest[]> {
    const where = status ? { status } : {};
    return this.requestsRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findByClient(clientId: string): Promise<QuoteRequest[]> {
    return this.requestsRepository.find({
      where: { client: { id: clientId } },
      order: { createdAt: 'DESC' },
    });
  }

  async getForOptica(opticaId: string): Promise<QuoteRequest[]> {
    const junctions = await this.requestOpticaRepository.find({
      where: { optica: { id: opticaId } },
      relations: ['request'],
    });
    return junctions.map((j) => j.request);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async expireRequests(): Promise<void> {
    this.logger.log('[Cron] Checking for expired quote requests');

    const expiredRequests = await this.requestsRepository.find({
      where: {
        status: 'open',
        expiresAt: LessThan(new Date()),
      },
    });

    this.logger.log(`[Cron] Found ${expiredRequests.length} expired requests`);

    for (const request of expiredRequests) {
      await this.requestsRepository.update(request.id, { status: 'expired' });

      // Reject all pending quotes for this expired request
      await this.quotesRepository
        .createQueryBuilder()
        .update(Quote)
        .set({ status: 'rejected' })
        .where('"requestId" = :requestId AND status = :status', {
          requestId: request.id,
          status: 'pending',
        })
        .execute();

      // Expire all pending RequestOptica records
      await this.requestOpticaRepository
        .createQueryBuilder()
        .update(RequestOptica)
        .set({ status: 'expired' as any })
        .where('"requestId" = :requestId AND status = :status', {
          requestId: request.id,
          status: 'pending',
        })
        .execute();

      this.logger.log(`[Cron] Expired request ${request.id} (quotes rejected, opticas notified)`);
    }
  }
}
