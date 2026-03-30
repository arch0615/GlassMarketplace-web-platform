import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { DisputesService } from './disputes.service';
import { Dispute } from './dispute.entity';
import { DisputeMessage } from './dispute-message.entity';
import { DisputePhoto } from './dispute-photo.entity';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';
import { PaymentsService } from '../payments/payments.service';
import { SettingsService } from '../settings/settings.service';

describe('DisputesService', () => {
  let service: DisputesService;
  let disputesRepo: jest.Mocked<Partial<Repository<Dispute>>>;
  let messagesRepo: jest.Mocked<Partial<Repository<DisputeMessage>>>;
  let photosRepo: jest.Mocked<Partial<Repository<DisputePhoto>>>;
  let ordersService: Record<string, jest.Mock>;
  let usersService: Record<string, jest.Mock>;
  let paymentsService: Record<string, jest.Mock>;
  let settingsService: Record<string, jest.Mock>;

  beforeEach(async () => {
    disputesRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
    };
    messagesRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };
    photosRepo = {
      create: jest.fn(),
      save: jest.fn(),
    };
    ordersService = {
      findById: jest.fn(),
      updateStatus: jest.fn(),
    };
    usersService = {
      findById: jest.fn(),
    };
    paymentsService = {
      releasePayment: jest.fn(),
      refundPayment: jest.fn(),
    };
    settingsService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisputesService,
        { provide: getRepositoryToken(Dispute), useValue: disputesRepo },
        { provide: getRepositoryToken(DisputeMessage), useValue: messagesRepo },
        { provide: getRepositoryToken(DisputePhoto), useValue: photosRepo },
        { provide: OrdersService, useValue: ordersService },
        { provide: UsersService, useValue: usersService },
        { provide: PaymentsService, useValue: paymentsService },
        { provide: SettingsService, useValue: settingsService },
      ],
    }).compile();

    service = module.get<DisputesService>(DisputesService);
  });

  describe('create', () => {
    it('should create a dispute for an order within the dispute window', async () => {
      const order = {
        id: 'order-1',
        deliveredAt: new Date(), // just delivered — still within window
      };
      const user = { id: 'user-1', fullName: 'Test User' };
      const savedDispute = { id: 'dispute-1', order, openedBy: user, reason: 'defective', status: 'open' };

      ordersService.findById.mockResolvedValue(order);
      settingsService.get.mockResolvedValue('7');
      usersService.findById.mockResolvedValue(user);
      ordersService.updateStatus.mockResolvedValue(undefined);
      disputesRepo.create!.mockReturnValue(savedDispute as any);
      disputesRepo.save!.mockResolvedValue(savedDispute as any);

      const result = await service.create(
        { orderId: 'order-1', reason: 'defective', comment: 'Lens scratched' },
        'user-1',
      );

      expect(result).toEqual(savedDispute);
      expect(ordersService.updateStatus).toHaveBeenCalledWith('order-1', 'dispute', expect.any(String));
      expect(disputesRepo.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if the dispute window has expired', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30); // 30 days ago
      const order = { id: 'order-2', deliveredAt: pastDate };

      ordersService.findById.mockResolvedValue(order);
      settingsService.get.mockResolvedValue('7');

      await expect(
        service.create({ orderId: 'order-2', reason: 'defective', comment: '' }, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should save photos when photoUrls are provided', async () => {
      const order = { id: 'order-3', deliveredAt: null };
      const user = { id: 'user-1' };
      const savedDispute = { id: 'dispute-3', order, openedBy: user, reason: 'wrong_product', status: 'open' };

      ordersService.findById.mockResolvedValue(order);
      usersService.findById.mockResolvedValue(user);
      ordersService.updateStatus.mockResolvedValue(undefined);
      disputesRepo.create!.mockReturnValue(savedDispute as any);
      disputesRepo.save!.mockResolvedValue(savedDispute as any);
      photosRepo.create!.mockImplementation((data) => data as any);
      photosRepo.save!.mockResolvedValue({} as any);

      await service.create(
        { orderId: 'order-3', reason: 'wrong_product', comment: '' },
        'user-1',
        ['https://img.example.com/a.jpg', 'https://img.example.com/b.jpg'],
      );

      expect(photosRepo.create).toHaveBeenCalledTimes(2);
      expect(photosRepo.save).toHaveBeenCalledTimes(2);
    });
  });

  describe('addMessage', () => {
    it('should add a message to an open dispute', async () => {
      const dispute = { id: 'dispute-1', status: 'open' };
      const sender = { id: 'user-1', role: 'client' };
      const savedMessage = { id: 'msg-1', dispute, sender, senderRole: 'client', message: 'Hello' };

      disputesRepo.findOne!.mockResolvedValue(dispute as any);
      usersService.findById.mockResolvedValue(sender);
      messagesRepo.create!.mockReturnValue(savedMessage as any);
      messagesRepo.save!.mockResolvedValue(savedMessage as any);

      const result = await service.addMessage('dispute-1', 'user-1', { message: 'Hello' });

      expect(result).toEqual(savedMessage);
      expect(messagesRepo.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when adding a message to a closed dispute', async () => {
      const dispute = { id: 'dispute-2', status: 'resolved' };
      disputesRepo.findOne!.mockResolvedValue(dispute as any);

      await expect(
        service.addMessage('dispute-2', 'user-1', { message: 'Hello' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('resolve', () => {
    it('should resolve a dispute with refund decision and call refundPayment', async () => {
      const dispute = { id: 'dispute-1', status: 'open', order: { id: 'order-1' } };
      const resolved = { ...dispute, status: 'refunded', adminDecision: 'Full refund' };

      disputesRepo.findOne!
        .mockResolvedValueOnce(dispute as any)   // first call: find open dispute
        .mockResolvedValueOnce(resolved as any); // second call: return updated
      disputesRepo.update!.mockResolvedValue(undefined as any);
      paymentsService.refundPayment.mockResolvedValue(undefined);
      ordersService.updateStatus.mockResolvedValue(undefined);

      const result = await service.resolve('dispute-1', {
        decision: 'refund',
        adminDecision: 'Full refund',
      });

      expect(result.status).toBe('refunded');
      expect(paymentsService.refundPayment).toHaveBeenCalledWith('order-1');
      expect(ordersService.updateStatus).toHaveBeenCalledWith('order-1', 'refunded', expect.any(String));
    });

    it('should resolve a dispute with release decision and call releasePayment', async () => {
      const dispute = { id: 'dispute-1', status: 'open', order: { id: 'order-1' } };
      const resolved = { ...dispute, status: 'resolved', adminDecision: 'No issue found' };

      disputesRepo.findOne!
        .mockResolvedValueOnce(dispute as any)
        .mockResolvedValueOnce(resolved as any);
      disputesRepo.update!.mockResolvedValue(undefined as any);
      paymentsService.releasePayment.mockResolvedValue(undefined);
      ordersService.updateStatus.mockResolvedValue(undefined);

      const result = await service.resolve('dispute-1', {
        decision: 'release',
        adminDecision: 'No issue found',
      });

      expect(result.status).toBe('resolved');
      expect(paymentsService.releasePayment).toHaveBeenCalledWith('order-1');
    });
  });
});
