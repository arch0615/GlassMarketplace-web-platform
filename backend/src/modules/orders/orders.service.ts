import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Order } from './order.entity';
import { OrderStatusHistory } from './order-status-history.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { QuotesService } from '../quotes/quotes.service';
import { CatalogService } from '../catalog/catalog.service';
import { PaymentsService } from '../payments/payments.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderStatusHistory)
    private readonly historyRepository: Repository<OrderStatusHistory>,
    private readonly quotesService: QuotesService,
    private readonly catalogService: CatalogService,
    private readonly paymentsService: PaymentsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateOrderDto, clientId: string): Promise<Order> {
    const quote = await this.quotesService.findById(dto.quoteId);

    if (quote.status !== 'accepted') {
      throw new BadRequestException('Can only create an order from an accepted quote');
    }

    let selectedFrame = null;
    if (dto.selectedFrameId) {
      selectedFrame = await this.catalogService.findById(dto.selectedFrameId);
    }

    const order = this.ordersRepository.create({
      quote,
      client: quote.request.client,
      optica: quote.optica,
      selectedFrame,
      amount: dto.amount ?? Number(quote.totalPrice),
      status: 'payment_pending',
    });

    const savedOrder = await this.ordersRepository.save(order);
    await this.recordHistory(savedOrder, 'payment_pending', 'Order created');

    // Create MP payment preference (placeholder)
    const prefId = await this.paymentsService.createPaymentPreference(savedOrder);
    await this.ordersRepository.update(savedOrder.id, { mpPaymentId: prefId });

    return this.findById(savedOrder.id);
  }

  async findById(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return order;
  }

  async findByClient(clientId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { client: { id: clientId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findByOptica(opticaId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { optica: { id: opticaId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({ order: { createdAt: 'DESC' } });
  }

  async markDelivered(orderId: string, opticaUserId: string): Promise<Order> {
    const order = await this.findById(orderId);

    if (order.optica.user?.id !== opticaUserId) {
      throw new BadRequestException('Not authorized to update this order');
    }
    if (!['payment_held', 'in_process'].includes(order.status)) {
      throw new BadRequestException(`Cannot mark delivered from status: ${order.status}`);
    }

    const deliveredAt = new Date();
    const verificationDeadline = new Date(deliveredAt.getTime() + 48 * 60 * 60 * 1000);

    await this.ordersRepository.update(orderId, {
      status: 'delivered',
      deliveredAt,
      verificationDeadline,
    });

    const updated = await this.findById(orderId);
    await this.recordHistory(updated, 'delivered', 'Marked as delivered by óptica');
    await this.notificationsService.notifyOrderStatus(updated, 'delivered');

    return updated;
  }

  async confirmReceipt(orderId: string, clientId: string): Promise<Order> {
    const order = await this.findById(orderId);

    if (order.client.id !== clientId) {
      throw new BadRequestException('Not authorized to confirm this order');
    }
    if (order.status !== 'delivered') {
      throw new BadRequestException('Order must be in delivered status to confirm');
    }

    await this.ordersRepository.update(orderId, {
      status: 'completed',
      completedAt: new Date(),
    });

    const updated = await this.findById(orderId);
    await this.recordHistory(updated, 'completed', 'Receipt confirmed by client');
    await this.paymentsService.releasePayment(orderId);
    await this.notificationsService.notifyOrderStatus(updated, 'completed');

    return updated;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async autoRelease(): Promise<void> {
    this.logger.log('[Cron] Running auto-release check for expired verification windows');

    const overdueOrders = await this.ordersRepository.find({
      where: {
        status: 'delivered',
        verificationDeadline: LessThan(new Date()),
      },
    });

    this.logger.log(`[Cron] Found ${overdueOrders.length} orders past verification deadline`);

    for (const order of overdueOrders) {
      await this.ordersRepository.update(order.id, {
        status: 'completed',
        completedAt: new Date(),
      });
      await this.recordHistory(order, 'completed', 'Auto-completed: verification window expired');
      await this.paymentsService.releasePayment(order.id);
      this.logger.log(`[Cron] Auto-released order ${order.id}`);
    }
  }

  private async recordHistory(order: Order, status: string, note?: string): Promise<void> {
    const entry = this.historyRepository.create({ order, status, note });
    await this.historyRepository.save(entry);
  }

  async updateStatus(orderId: string, status: string, note?: string): Promise<Order> {
    await this.ordersRepository.update(orderId, { status: status as any });
    const updated = await this.findById(orderId);
    await this.recordHistory(updated, status, note);
    return updated;
  }
}
