import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';
import { OrderStatusHistory } from './order-status-history.entity';
import { QuotesService } from '../quotes/quotes.service';
import { CatalogService } from '../catalog/catalog.service';
import { PaymentsService } from '../payments/payments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SettingsService } from '../settings/settings.service';
import { CreateOrderDto } from './dto/create-order.dto';

describe('OrdersService', () => {
  let service: OrdersService;
  let ordersRepo: Record<string, jest.Mock>;
  let historyRepo: Record<string, jest.Mock>;
  let quotesService: Record<string, jest.Mock>;
  let catalogService: Record<string, jest.Mock>;
  let paymentsService: Record<string, jest.Mock>;
  let notificationsService: Record<string, jest.Mock>;
  let settingsService: Record<string, jest.Mock>;

  beforeEach(async () => {
    ordersRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
    };

    historyRepo = {
      create: jest.fn().mockImplementation((data: any) => data),
      save: jest.fn().mockResolvedValue({}),
    };

    quotesService = { findById: jest.fn() };
    catalogService = { findById: jest.fn() };
    paymentsService = {
      createPaymentPreference: jest.fn(),
      releasePayment: jest.fn().mockResolvedValue({}),
      refundPayment: jest.fn().mockResolvedValue({}),
    };
    notificationsService = {
      notifyOrderStatus: jest.fn().mockResolvedValue(undefined),
    };
    settingsService = { get: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: ordersRepo },
        { provide: getRepositoryToken(OrderStatusHistory), useValue: historyRepo },
        { provide: QuotesService, useValue: quotesService },
        { provide: CatalogService, useValue: catalogService },
        { provide: PaymentsService, useValue: paymentsService },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: SettingsService, useValue: settingsService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an order with correct commission calculation', async () => {
      const mockQuote = {
        id: 'quote-1',
        status: 'accepted',
        totalPrice: 1000,
        request: { client: { id: 'client-1' } },
        optica: { id: 'optica-1' },
      };
      const savedOrder: Partial<Order> = {
        id: 'order-1',
        amount: 1000,
        commissionAmount: 100,
        status: 'payment_pending',
      };

      quotesService.findById.mockResolvedValue(mockQuote);
      settingsService.get.mockResolvedValue('10'); // 10% commission
      ordersRepo.create.mockReturnValue(savedOrder);
      ordersRepo.save.mockResolvedValue(savedOrder);
      ordersRepo.findOne.mockResolvedValue({ ...savedOrder, mpPaymentId: 'pref-123' });
      ordersRepo.update.mockResolvedValue({});
      paymentsService.createPaymentPreference.mockResolvedValue({ preferenceId: 'pref-123' });

      const dto: CreateOrderDto = { quoteId: 'quote-1' };
      const result = await service.create(dto, 'client-1');

      expect(ordersRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 1000,
          commissionAmount: 100,
          status: 'payment_pending',
        }),
      );
      expect(paymentsService.createPaymentPreference).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw if quote is not accepted', async () => {
      quotesService.findById.mockResolvedValue({
        id: 'quote-1',
        status: 'pending',
        totalPrice: 500,
      });

      const dto: CreateOrderDto = { quoteId: 'quote-1' };
      await expect(service.create(dto, 'client-1')).rejects.toThrow(BadRequestException);
    });

    it('should use custom amount when provided in dto', async () => {
      const mockQuote = {
        id: 'quote-1',
        status: 'accepted',
        totalPrice: 1000,
        request: { client: { id: 'client-1' } },
        optica: { id: 'optica-1' },
      };
      const savedOrder: Partial<Order> = { id: 'order-1', amount: 750, status: 'payment_pending' };

      quotesService.findById.mockResolvedValue(mockQuote);
      settingsService.get.mockResolvedValue('10');
      ordersRepo.create.mockReturnValue(savedOrder);
      ordersRepo.save.mockResolvedValue(savedOrder);
      ordersRepo.findOne.mockResolvedValue(savedOrder);
      ordersRepo.update.mockResolvedValue({});
      paymentsService.createPaymentPreference.mockResolvedValue({ preferenceId: 'pref-456' });

      const dto: CreateOrderDto = { quoteId: 'quote-1', amount: 750 };
      await service.create(dto, 'client-1');

      expect(ordersRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 750 }),
      );
    });
  });

  describe('markDelivered', () => {
    it('should mark an order as delivered', async () => {
      const mockOrder: Partial<Order> = {
        id: 'order-1',
        status: 'payment_held' as any,
        optica: { id: 'optica-1', user: { id: 'optica-user-1' } } as any,
      };

      ordersRepo.findOne.mockResolvedValue(mockOrder);
      ordersRepo.update.mockResolvedValue({});

      await service.markDelivered('order-1', 'optica-user-1');

      expect(ordersRepo.update).toHaveBeenCalledWith(
        'order-1',
        expect.objectContaining({
          status: 'delivered',
          deliveredAt: expect.any(Date),
          verificationDeadline: expect.any(Date),
        }),
      );
    });

    it('should throw if user is not the optica owner', async () => {
      const mockOrder: Partial<Order> = {
        id: 'order-1',
        status: 'payment_held' as any,
        optica: { id: 'optica-1', user: { id: 'optica-user-1' } } as any,
      };

      ordersRepo.findOne.mockResolvedValue(mockOrder);

      await expect(service.markDelivered('order-1', 'wrong-user')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('confirmReceipt', () => {
    it('should confirm receipt and release payment', async () => {
      const mockOrder: Partial<Order> = {
        id: 'order-1',
        status: 'delivered' as any,
        client: { id: 'client-1' } as any,
      };

      ordersRepo.findOne.mockResolvedValue(mockOrder);
      ordersRepo.update.mockResolvedValue({});

      await service.confirmReceipt('order-1', 'client-1');

      expect(ordersRepo.update).toHaveBeenCalledWith(
        'order-1',
        expect.objectContaining({
          status: 'completed',
          completedAt: expect.any(Date),
        }),
      );
      expect(paymentsService.releasePayment).toHaveBeenCalledWith('order-1');
      expect(notificationsService.notifyOrderStatus).toHaveBeenCalled();
    });

    it('should throw if order is not in delivered status', async () => {
      const mockOrder: Partial<Order> = {
        id: 'order-1',
        status: 'payment_held' as any,
        client: { id: 'client-1' } as any,
      };

      ordersRepo.findOne.mockResolvedValue(mockOrder);

      await expect(service.confirmReceipt('order-1', 'client-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('autoRelease', () => {
    it('should auto-complete orders past verification deadline', async () => {
      const overdueOrders: Partial<Order>[] = [
        { id: 'order-1', status: 'delivered' as any, verificationDeadline: new Date('2020-01-01') },
        { id: 'order-2', status: 'delivered' as any, verificationDeadline: new Date('2020-06-01') },
      ];

      ordersRepo.find.mockResolvedValue(overdueOrders);
      ordersRepo.update.mockResolvedValue({});
      ordersRepo.findOne.mockImplementation(({ where }: any) => {
        return Promise.resolve(overdueOrders.find((o) => o.id === where.id));
      });

      await service.autoRelease();

      expect(ordersRepo.update).toHaveBeenCalledWith(
        'order-1',
        expect.objectContaining({ status: 'completed' }),
      );
      expect(ordersRepo.update).toHaveBeenCalledWith(
        'order-2',
        expect.objectContaining({ status: 'completed' }),
      );
      expect(paymentsService.releasePayment).toHaveBeenCalledWith('order-1');
      expect(paymentsService.releasePayment).toHaveBeenCalledWith('order-2');
    });

    it('should do nothing when there are no overdue orders', async () => {
      ordersRepo.find.mockResolvedValue([]);

      await service.autoRelease();

      expect(ordersRepo.update).not.toHaveBeenCalled();
      expect(paymentsService.releasePayment).not.toHaveBeenCalled();
    });
  });
});
