import { Controller, Post, Get, Param, Body, Query, Logger } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/order.entity';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  @Post('webhook')
  async handleWebhook(
    @Body() payload: any,
    @Query('type') type?: string,
    @Query('data.id') dataId?: string,
  ) {
    this.logger.log(`[MP Webhook] type=${type || payload?.type}, data.id=${dataId || payload?.data?.id}`);

    const eventType = type || payload?.type;
    const paymentId = dataId || payload?.data?.id;

    if (eventType === 'payment' && paymentId) {
      try {
        const payment = await this.paymentsService.getPaymentInfo(String(paymentId));
        const orderId = payment.external_reference;

        if (orderId && payment.status === 'approved') {
          const order = await this.ordersRepository.findOne({ where: { id: orderId } });
          if (order && order.status === 'payment_pending') {
            await this.ordersRepository.update(orderId, {
              status: 'payment_held',
              mpPaymentId: String(paymentId),
            });
            this.logger.log(`[MP Webhook] Order ${orderId} payment approved, status -> payment_held`);
          }
        } else if (orderId && payment.status === 'rejected') {
          this.logger.log(`[MP Webhook] Payment rejected for order ${orderId}`);
        }
      } catch (error) {
        this.logger.error(`[MP Webhook] Error processing: ${error.message}`);
      }
    }

    return { received: true };
  }

  @Get('preference/:orderId')
  async getPreference(@Param('orderId') orderId: string) {
    const order = await this.ordersRepository.findOne({ where: { id: orderId } });
    if (!order) {
      return { error: 'Order not found' };
    }
    return { preferenceId: order.mpPaymentId };
  }
}
