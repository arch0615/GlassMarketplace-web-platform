import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestsService } from './requests.service';
import { QuoteRequest } from './quote-request.entity';
import { RequestOptica } from './request-optica.entity';
import { Quote } from '../quotes/quote.entity';
import { UsersService } from '../users/users.service';
import { OpticasService } from '../opticas/opticas.service';
import { PrescriptionsService } from '../prescriptions/prescriptions.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SettingsService } from '../settings/settings.service';
import { CreateRequestDto } from './dto/create-request.dto';

describe('RequestsService', () => {
  let service: RequestsService;
  let requestsRepo: Record<string, jest.Mock>;
  let requestOpticaRepo: Record<string, jest.Mock>;
  let quotesRepo: Record<string, jest.Mock>;
  let usersService: Record<string, jest.Mock>;
  let opticasService: Record<string, jest.Mock>;
  let prescriptionsService: Record<string, jest.Mock>;
  let notificationsService: Record<string, jest.Mock>;
  let settingsService: Record<string, jest.Mock>;

  beforeEach(async () => {
    requestsRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
    };

    requestOpticaRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      }),
    };

    quotesRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      }),
    };

    usersService = { findById: jest.fn() };
    opticasService = { findById: jest.fn(), findNearby: jest.fn(), update: jest.fn() };
    prescriptionsService = { findById: jest.fn() };
    notificationsService = { notifyOpticaNewRequest: jest.fn().mockResolvedValue(undefined) };
    settingsService = { get: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        { provide: getRepositoryToken(QuoteRequest), useValue: requestsRepo },
        { provide: getRepositoryToken(RequestOptica), useValue: requestOpticaRepo },
        { provide: getRepositoryToken(Quote), useValue: quotesRepo },
        { provide: UsersService, useValue: usersService },
        { provide: OpticasService, useValue: opticasService },
        { provide: PrescriptionsService, useValue: prescriptionsService },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: SettingsService, useValue: settingsService },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a request and distribute to nearby opticas', async () => {
      const mockClient = { id: 'client-1', email: 'client@test.com' };
      const mockOpticas = [
        {
          id: 'optica-1',
          lat: '-34.60',
          lng: '-58.38',
          responseRate: 0.9,
          subscriptionTier: 'pro',
          totalRequestCount: 5,
          user: { email: 'optica1@test.com' },
        },
        {
          id: 'optica-2',
          lat: '-34.61',
          lng: '-58.39',
          responseRate: 0.5,
          subscriptionTier: 'free',
          totalRequestCount: 3,
          user: { email: 'optica2@test.com' },
        },
      ];

      const savedRequest: Partial<QuoteRequest> = {
        id: 'req-1',
        status: 'open',
        lensType: 'progressive',
        clientLat: -34.6,
        clientLng: -58.38,
      };

      usersService.findById.mockResolvedValue(mockClient);
      settingsService.get.mockImplementation((key: string) => {
        const settings: Record<string, string> = {
          quote_expiry_hours: '48',
          outer_radius_km: '10',
          smart_select_max: '5',
          smart_select_min: '3',
        };
        return Promise.resolve(settings[key] || null);
      });
      opticasService.findNearby.mockResolvedValue(mockOpticas);
      opticasService.update.mockResolvedValue({});
      requestsRepo.create.mockReturnValue(savedRequest);
      requestsRepo.save.mockResolvedValue(savedRequest);
      requestOpticaRepo.create.mockImplementation((data: any) => data);
      requestOpticaRepo.save.mockResolvedValue({});

      const dto: CreateRequestDto = {
        lensType: 'progressive',
        clientLat: -34.6,
        clientLng: -58.38,
      };

      const result = await service.create(dto, 'client-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('req-1');
      expect(requestsRepo.save).toHaveBeenCalled();
      expect(opticasService.findNearby).toHaveBeenCalledWith(-34.6, -58.38, 10);
      expect(requestOpticaRepo.save).toHaveBeenCalledTimes(2);
      expect(notificationsService.notifyOpticaNewRequest).toHaveBeenCalledTimes(2);
    });
  });

  describe('expireRequests', () => {
    it('should expire open requests past their expiresAt date', async () => {
      const expiredReqs: Partial<QuoteRequest>[] = [
        { id: 'req-expired-1', status: 'open', expiresAt: new Date('2020-01-01') },
        { id: 'req-expired-2', status: 'open', expiresAt: new Date('2020-06-01') },
      ];

      requestsRepo.find.mockResolvedValue(expiredReqs);
      requestsRepo.update.mockResolvedValue({});

      await service.expireRequests();

      expect(requestsRepo.update).toHaveBeenCalledWith('req-expired-1', { status: 'expired' });
      expect(requestsRepo.update).toHaveBeenCalledWith('req-expired-2', { status: 'expired' });
      expect(quotesRepo.createQueryBuilder).toHaveBeenCalledTimes(2);
      expect(requestOpticaRepo.createQueryBuilder).toHaveBeenCalledTimes(2);
    });

    it('should do nothing when there are no expired requests', async () => {
      requestsRepo.find.mockResolvedValue([]);

      await service.expireRequests();

      expect(requestsRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('scoreOpticas (via create)', () => {
    it('should prioritize premium opticas with higher response rates', async () => {
      const mockClient = { id: 'client-1' };

      // Premium, high response rate, close by
      const opticaPremium = {
        id: 'optica-premium',
        lat: '-34.600',
        lng: '-58.380',
        responseRate: 1.0,
        subscriptionTier: 'premium',
        totalRequestCount: 10,
        user: { email: 'premium@test.com' },
      };
      // Free, low response rate, farther away
      const opticaFree = {
        id: 'optica-free',
        lat: '-34.650',
        lng: '-58.430',
        responseRate: 0.2,
        subscriptionTier: 'free',
        totalRequestCount: 2,
        user: { email: 'free@test.com' },
      };

      usersService.findById.mockResolvedValue(mockClient);
      settingsService.get.mockImplementation((key: string) => {
        const settings: Record<string, string> = {
          quote_expiry_hours: '48',
          outer_radius_km: '50',
          smart_select_max: '5',
          smart_select_min: '3',
        };
        return Promise.resolve(settings[key] || null);
      });
      // Return free first, premium second - scoring should reorder
      opticasService.findNearby.mockResolvedValue([opticaFree, opticaPremium]);
      opticasService.update.mockResolvedValue({});
      requestsRepo.create.mockReturnValue({ id: 'req-1' });
      requestsRepo.save.mockResolvedValue({ id: 'req-1' });
      requestOpticaRepo.create.mockImplementation((data: any) => data);
      requestOpticaRepo.save.mockResolvedValue({});

      const dto: CreateRequestDto = {
        lensType: 'monofocal',
        clientLat: -34.6,
        clientLng: -58.38,
      };

      await service.create(dto, 'client-1');

      // The premium optica should be notified first (saved first) due to higher score
      const firstSaveCall = requestOpticaRepo.save.mock.calls[0][0];
      expect(firstSaveCall.optica.id).toBe('optica-premium');
    });
  });
});
