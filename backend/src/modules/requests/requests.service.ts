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
      serviceType: dto.serviceType,
      gender: dto.gender,
      lensType: dto.lensType,
      observations: dto.observations,
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

    const selected = this.selectOpticasFairly(
      nearbyOpticas,
      dto.clientLat,
      dto.clientLng,
      radiusKm,
      Math.max(maxSelect, minSelect),
    );

    for (const optica of selected) {
      const junction = this.requestOpticaRepository.create({
        request: savedRequest,
        optica,
        status: 'pending',
      });
      await this.requestOpticaRepository.save(junction);

      // Increment optica's request count
      await this.opticasService.update(optica.id, {
        totalRequestCount: optica.totalRequestCount + 1,
      } as any);
    }

    // Send email notifications in the background (best-effort, don't block the response)
    for (const optica of selected) {
      if (optica.user?.email) {
        this.notificationsService.notifyOpticaNewRequest(
          optica.user.email,
          savedRequest.id,
        ).catch((err) =>
          this.logger.warn(`Failed to notify ${optica.user.email}: ${err.message}`),
        );
      }
    }

    // Notify admins so they can monitor new requests in real time.
    this.usersService
      .findAll('admin')
      .then((admins) => {
        for (const admin of admins) {
          if (!admin.email) continue;
          this.notificationsService
            .notifyAdminNewRequest(admin.email, {
              requestId: savedRequest.id,
              clientName: client.fullName,
              opticasNotified: selected.length,
            })
            .catch((err) =>
              this.logger.warn(`Failed to notify admin ${admin.email}: ${err.message}`),
            );
        }
      })
      .catch((err) => this.logger.warn(`Failed to fetch admins for notification: ${err.message}`));

    return savedRequest;
  }

  /**
   * Fair-rotation selection of ópticas for a new request.
   *
   * Quality signals (distance, response rate, subscription tier) still drive
   * the base score, but selection is a *weighted random sample without
   * replacement* instead of a hard top-k. The weight is:
   *
   *   weight = baseScore × fairness
   *
   * where `fairness = 1 / (1 + totalRequestCount / 10)`. Ópticas that have
   * already received many requests are proportionally less likely to be
   * picked again, so the same top 5 won't win every single time. Over many
   * requests every in-range óptica eventually gets its turn, while still
   * favoring closer / more responsive / higher-tier shops on average.
   *
   * Uses the Efraimidis-Spirakis reservoir algorithm: assign each item a
   * key `log(rand) / weight`, then take the `k` items with the largest keys
   * (equivalent to sampling without replacement proportional to weight).
   */
  private selectOpticasFairly(
    opticas: Optica[],
    clientLat: number,
    clientLng: number,
    maxDist: number,
    k: number,
  ): Optica[] {
    if (opticas.length <= k) return opticas;

    const tierBoost: Record<string, number> = { free: 0, pro: 5, premium: 10 };

    const keyed = opticas.map((o) => {
      const dist = this.haversine(clientLat, clientLng, Number(o.lat), Number(o.lng));
      const distScore = Math.max(0, 100 - (dist / maxDist) * 100);
      const responseScore = Number(o.responseRate) * 20;
      const tierScore = tierBoost[o.subscriptionTier] || 0;
      const baseScore = distScore + responseScore + tierScore;

      // Fairness penalty: the more requests an óptica already received, the
      // less likely it is to win the next slot. +10 floor keeps brand-new /
      // low-score ópticas from being locked out entirely.
      const fairness = 1 / (1 + (o.totalRequestCount || 0) / 10);
      const weight = Math.max(5, baseScore + 10) * fairness;

      // Efraimidis-Spirakis key
      const key = Math.log(Math.random()) / weight;
      return { optica: o, key };
    });

    // Largest keys win (closer to 0, since log(rand) is negative).
    keyed.sort((a, b) => b.key - a.key);
    return keyed.slice(0, k).map((x) => x.optica);
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

  async getForOptica(opticaId: string): Promise<any[]> {
    const junctions = await this.requestOpticaRepository.find({
      where: { optica: { id: opticaId } },
      relations: ['request'],
    });
    return junctions.map((j) => ({
      ...j.request,
      opticaStatus: j.status,
    }));
  }

  async rejectByOptica(requestId: string, opticaId: string): Promise<{ success: boolean }> {
    const junction = await this.requestOpticaRepository.findOne({
      where: { request: { id: requestId }, optica: { id: opticaId }, status: 'pending' as any },
    });
    if (!junction) {
      throw new NotFoundException('Assignment not found or already handled');
    }
    await this.requestOpticaRepository.update(junction.id, { status: 'ignored' as any });
    return { success: true };
  }

  async cancelByClient(id: string, clientId: string): Promise<QuoteRequest> {
    const request = await this.findById(id);
    if (request.client.id !== clientId) {
      throw new NotFoundException('Request not found');
    }
    if (request.status !== 'open') {
      throw new NotFoundException('Only open requests can be cancelled');
    }

    await this.requestsRepository.update(id, { status: 'cancelled' });

    // Reject all pending quotes
    await this.quotesRepository
      .createQueryBuilder()
      .update(Quote)
      .set({ status: 'rejected' })
      .where('"requestId" = :requestId AND status = :status', {
        requestId: id,
        status: 'pending',
      })
      .execute();

    // Cancel all pending optica assignments
    await this.requestOpticaRepository
      .createQueryBuilder()
      .update(RequestOptica)
      .set({ status: 'expired' as any })
      .where('"requestId" = :requestId AND status = :status', {
        requestId: id,
        status: 'pending',
      })
      .execute();

    return this.findById(id);
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
