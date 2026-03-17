import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  async createPaymentPreference(order: { id: string; amount?: number }): Promise<string> {
    this.logger.log(`[MP] Creating payment preference for order ${order.id}, amount: ${order.amount}`);
    // TODO: integrate with Mercado Pago API using MP_ACCESS_TOKEN
    const mockPreferenceId = `mock_pref_${order.id}`;
    this.logger.log(`[MP] Mock preference created: ${mockPreferenceId}`);
    return mockPreferenceId;
  }

  async releasePayment(orderId: string): Promise<void> {
    this.logger.log(`[MP] Releasing payment for order ${orderId}`);
    // TODO: call Mercado Pago escrow release API
  }

  async refundPayment(orderId: string): Promise<void> {
    this.logger.log(`[MP] Refunding payment for order ${orderId}`);
    // TODO: call Mercado Pago refund API
  }
}
