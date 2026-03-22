import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private mpClient: MercadoPagoConfig | null = null;

  constructor(private readonly configService: ConfigService) {
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
    client?: { email?: string; fullName?: string };
    optica?: { businessName?: string };
  }): Promise<string> {
    if (!this.mpClient) {
      const mockId = `mock_pref_${order.id}`;
      this.logger.log(`[MP] Mock preference created: ${mockId}`);
      return mockId;
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
              title: `Pedido Lensia — ${order.optica?.businessName || 'Óptica'}`,
              quantity: 1,
              unit_price: Number(order.amount) || 0,
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
      return preference.id || '';
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
    // In Mercado Pago Marketplace Split Payments, payment release
    // happens automatically after the hold period. For manual release,
    // the marketplace account manages disbursements via MP API.
    // This is logged for audit trail.
  }

  async refundPayment(orderId: string): Promise<void> {
    this.logger.log(`[MP] Refunding payment for order ${orderId}`);
    // Refund would be processed via MP Payment refund API.
    // Requires the payment_id stored in order.mpPaymentId.
    // Implementation depends on MP account configuration.
  }
}
