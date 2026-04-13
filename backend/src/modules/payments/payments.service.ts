import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MercadoPagoConfig, Preference, Payment, PaymentRefund } from 'mercadopago';
import { Order } from '../orders/order.entity';

export interface PaymentPreferenceResult {
  preferenceId: string;
  initPoint: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private mpClient: MercadoPagoConfig | null = null;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {
    const accessToken = this.configService.get<string>('MP_ACCESS_TOKEN');
    if (accessToken) {
      this.mpClient = new MercadoPagoConfig({ accessToken });
      this.logger.log('[MP] Mercado Pago client initialized');
    } else {
      this.logger.warn('[MP] MP_ACCESS_TOKEN not set — payments will run in mock mode');
    }
  }

  async createPaymentPreference(order: {
    id: string;
    amount?: number;
    depositAmount?: number;
    paymentMode?: string;
    client?: { email?: string; fullName?: string };
    optica?: { businessName?: string };
  }): Promise<PaymentPreferenceResult> {
    // Charge deposit amount if in deposit mode, otherwise full amount
    const chargeAmount = order.paymentMode === 'deposit' && order.depositAmount
      ? Number(order.depositAmount)
      : Number(order.amount) || 0;
    const chargeLabel = order.paymentMode === 'deposit'
      ? `Seña (12%) — Pedido Lensia`
      : `Pedido Lensia — ${order.optica?.businessName || 'Óptica'}`;

    if (!this.mpClient) {
      const mockId = `mock_pref_${order.id}`;
      this.logger.log(`[MP] Mock preference created: ${mockId} ($${chargeAmount})`);
      return { preferenceId: mockId, initPoint: '' };
    }

    try {
      const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:5000');
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');

      const preferenceClient = new Preference(this.mpClient);
      const preference = await preferenceClient.create({
        body: {
          items: [
            {
              id: order.id,
              title: chargeLabel,
              quantity: 1,
              unit_price: chargeAmount,
              currency_id: 'ARS',
            },
          ],
          payer: {
            email: order.client?.email || undefined,
            name: order.client?.fullName || undefined,
          },
          back_urls: {
            success: `${frontendUrl}/cliente/pedidos`,
            failure: `${frontendUrl}/cliente/pedidos`,
            pending: `${frontendUrl}/cliente/pedidos`,
          },
          auto_return: 'approved',
          notification_url: `${appUrl}/payments/webhook`,
          external_reference: order.id,
          binary_mode: true,
        },
      });

      this.logger.log(`[MP] Preference created: ${preference.id}`);
      return {
        preferenceId: preference.id || '',
        initPoint: (preference as any).init_point || '',
      };
    } catch (error) {
      this.logger.error(`[MP] Error creating preference: ${error.message}`);
      throw error;
    }
  }

  async getPaymentInfo(paymentId: string): Promise<any> {
    if (!this.mpClient) {
      this.logger.log(`[MP] Mock: getPaymentInfo(${paymentId})`);
      return { status: 'approved' };
    }

    try {
      const paymentClient = new Payment(this.mpClient);
      const payment = await paymentClient.get({ id: Number(paymentId) });
      return payment;
    } catch (error) {
      this.logger.error(`[MP] Error getting payment: ${error.message}`);
      throw error;
    }
  }

  async releasePayment(orderId: string): Promise<void> {
    this.logger.log(`[MP] Releasing payment for order ${orderId}`);
    // With binary_mode + standard payments, funds are captured immediately on approval.
    // Release is tracked via order status transitions (completed).
    // For MP Marketplace split payments, disbursement is automatic after hold period.
  }

  async refundPayment(orderId: string): Promise<void> {
    this.logger.log(`[MP] Refunding payment for order ${orderId}`);

    const order = await this.ordersRepository.findOne({ where: { id: orderId } });
    if (!order?.mpPaymentId) {
      this.logger.warn(`[MP] No payment ID found for order ${orderId}, skipping refund`);
      return;
    }

    if (!this.mpClient) {
      this.logger.log(`[MP] Mock: refund for payment ${order.mpPaymentId}`);
      return;
    }

    try {
      const refundClient = new PaymentRefund(this.mpClient);
      await refundClient.total({ payment_id: Number(order.mpPaymentId) });
      this.logger.log(`[MP] Refund processed for payment ${order.mpPaymentId}`);
    } catch (error) {
      this.logger.error(`[MP] Error refunding payment ${order.mpPaymentId}: ${error.message}`);
    }
  }
}
