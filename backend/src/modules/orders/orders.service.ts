import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Order, OrderStatus } from './order.entity';
import { OrderStatusHistory } from './order-status-history.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { QuotesService } from '../quotes/quotes.service';
import { CatalogService } from '../catalog/catalog.service';
import { PaymentsService } from '../payments/payments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SettingsService } from '../settings/settings.service';

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
    private readonly settingsService: SettingsService,
  ) {}

  async create(dto: CreateOrderDto, clientId: string): Promise<Order> {
    const quote = await this.quotesService.findById(dto.quoteId);

    if (quote.status !== 'accepted') {
      throw new BadRequestException('Can only create an order from an accepted quote');
    }

    // Require billing info before allowing checkout — AR invoicing needs CUIT + condición de IVA.
    const client = quote.request.client;
    if (!client?.cuit || !client?.invoiceCondition) {
      throw new BadRequestException(
        'Completá tus datos de facturación (CUIT y condición frente a IVA) antes de confirmar el pedido.',
      );
    }

    let selectedFrame = null;
    if (dto.selectedFrameId) {
      selectedFrame = await this.catalogService.findById(dto.selectedFrameId);
    }

    // Calculate total: lens price + frame price
    const lensPrice = dto.amount ?? Number(quote.totalPrice);
    const framePrice = selectedFrame ? Number(selectedFrame.priceMin || 0) : 0;
    const amount = lensPrice + framePrice;

    // Lensia commission rate (default 12%)
    const commissionRateStr = await this.settingsService.get('commission_rate_pct');
    const commissionRate = Number(commissionRateStr) || 12;
    const commissionAmount = Math.round((amount * commissionRate) / 100 * 100) / 100;

    // Payment mode: full (100%) or deposit (12%)
    const paymentMode = dto.paymentMode || 'full';
    const DEPOSIT_RATE = commissionRate / 100;
    const depositAmount = paymentMode === 'deposit'
      ? Math.round(amount * DEPOSIT_RATE * 100) / 100
      : null;

    // Delivery method: pickup always allowed; delivery only when paying in full.
    // When paying a deposit, the rest is settled in person, so pickup is mandatory.
    const deliveryMethod = paymentMode === 'deposit'
      ? 'pickup'
      : (dto.deliveryMethod || 'pickup');
    if (deliveryMethod === 'delivery' && !dto.deliveryAddress?.trim()) {
      throw new BadRequestException('Se requiere una dirección de envío cuando elegís envío a domicilio.');
    }
    const deliveryAddress = deliveryMethod === 'delivery' ? dto.deliveryAddress!.trim() : null;

    const paymentDeadline = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes

    const order = this.ordersRepository.create({
      quote,
      client: quote.request.client,
      optica: quote.optica,
      selectedFrame,
      amount,
      commissionAmount,
      paymentMode,
      depositAmount,
      deliveryMethod,
      deliveryAddress,
      status: 'payment_pending',
      paymentDeadline,
    });

    const savedOrder = await this.ordersRepository.save(order);
    await this.recordHistory(savedOrder, 'payment_pending', 'Order created');

    // Create MP payment preference
    const { preferenceId } = await this.paymentsService.createPaymentPreference(savedOrder);
    await this.ordersRepository.update(savedOrder.id, { mpPaymentId: preferenceId });

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

  async findByOptica(opticaUserId: string): Promise<Order[]> {
    // Filter by the optica's linked user ID, not the optica.id
    return this.ordersRepository.find({
      where: { optica: { user: { id: opticaUserId } } },
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

  async cancelOrder(orderId: string, userId: string): Promise<Order> {
    const order = await this.findById(orderId);

    if (order.client.id !== userId) {
      throw new BadRequestException('Not authorized to cancel this order');
    }
    if (!['payment_pending', 'payment_held'].includes(order.status)) {
      throw new BadRequestException(`Cannot cancel order in status: ${order.status}`);
    }

    await this.ordersRepository.update(orderId, {
      status: 'cancelled',
    });

    const updated = await this.findById(orderId);
    await this.recordHistory(updated, 'cancelled', 'Cancelled by client');

    if (order.status === 'payment_held') {
      await this.paymentsService.refundPayment(orderId);
    }

    await this.notificationsService.notifyOrderStatus(updated, 'cancelled');
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

  @Cron('*/2 * * * *') // Every 2 minutes
  async expireUnpaidOrders(): Promise<void> {
    const expired = await this.ordersRepository.find({
      where: {
        status: 'payment_pending' as OrderStatus,
        paymentDeadline: LessThan(new Date()),
      },
    });

    if (expired.length > 0) {
      this.logger.log(`[Cron] Cancelling ${expired.length} unpaid orders past 20min deadline`);
      for (const order of expired) {
        await this.ordersRepository.update(order.id, { status: 'cancelled' });
        await this.recordHistory(order, 'cancelled', 'Auto-cancelled: payment deadline expired (20 min)');
        this.logger.log(`[Cron] Auto-cancelled order ${order.id}`);
      }
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
