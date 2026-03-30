import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { PaymentsService } from './payments.service';
import { Order } from '../orders/order.entity';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let ordersRepo: jest.Mocked<Partial<Repository<Order>>>;
  let configService: Record<string, jest.Mock>;

  beforeEach(async () => {
    ordersRepo = {
      findOne: jest.fn(),
    };

    // Return empty values so mpClient stays null (mock mode)
    configService = {
      get: jest.fn().mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'MP_ACCESS_TOKEN') return undefined;
        return defaultValue ?? undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getRepositoryToken(Order), useValue: ordersRepo },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  describe('createPaymentPreference', () => {
    it('should return a mock preference ID and empty initPoint in mock mode', async () => {
      const order = {
        id: 'order-abc-123',
        amount: 5000,
        client: { email: 'test@example.com', fullName: 'John Doe' },
        optica: { businessName: 'Optica Sur' },
      };

      const result = await service.createPaymentPreference(order);

      expect(result.preferenceId).toBe('mock_pref_order-abc-123');
      expect(result.initPoint).toBe('');
    });

    it('should include the order id in the mock preference id', async () => {
      const result = await service.createPaymentPreference({
        id: 'xyz-789',
      });

      expect(result.preferenceId).toContain('xyz-789');
    });
  });

  describe('getPaymentInfo', () => {
    it('should return approved status in mock mode', async () => {
      const result = await service.getPaymentInfo('12345');

      expect(result).toEqual({ status: 'approved' });
    });
  });

  describe('refundPayment', () => {
    it('should skip refund when order has no mpPaymentId', async () => {
      ordersRepo.findOne!.mockResolvedValue({ id: 'order-1', mpPaymentId: null } as any);

      // Should not throw
      await expect(service.refundPayment('order-1')).resolves.toBeUndefined();
    });

    it('should log mock refund when mpPaymentId exists but no MP client', async () => {
      ordersRepo.findOne!.mockResolvedValue({
        id: 'order-2',
        mpPaymentId: 'pay_999',
      } as any);

      // Should complete without error in mock mode
      await expect(service.refundPayment('order-2')).resolves.toBeUndefined();
    });

    it('should skip refund when order is not found', async () => {
      ordersRepo.findOne!.mockResolvedValue(null);

      await expect(service.refundPayment('nonexistent')).resolves.toBeUndefined();
    });
  });
});
