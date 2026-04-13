import { Controller, Post, Get, Param, Body, Query, Logger, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/order.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NotificationsService } from '../notifications/notifications.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly notificationsService: NotificationsService,
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

            // Notify the optica that a paid order is ready to process
            const fullOrder = await this.ordersRepository.findOne({ where: { id: orderId } });
            const opticaEmail = fullOrder?.optica?.user?.email;
            if (opticaEmail) {
              this.notificationsService.sendEmail(
                opticaEmail,
                'Lensia — ¡Nuevo pedido pagado!',
                `<div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
                  <h2 style="color: #1E40AF; margin-bottom: 16px;">Lensia</h2>
                  <p>Un cliente acaba de pagar un pedido.</p>
                  <div style="background: #ECFDF5; border-radius: 8px; padding: 12px 16px; margin: 16px 0; font-size: 16px; font-weight: 600; color: #059669;">
                    Pedido #${orderId.slice(0, 8)} — $${Number(fullOrder.amount || 0).toLocaleString('es-AR')}
                  </div>
                  <p>El pago queda retenido hasta que marques el pedido como entregado y el cliente confirme la recepción.</p>
                  <p style="color: #64748B; font-size: 14px;">Ingresá a tu panel de óptica para procesarlo.</p>
                </div>`,
              ).catch((err) => this.logger.warn(`Failed to notify optica: ${err.message}`));
            }
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

  @UseGuards(JwtAuthGuard)
  @Get('preference/:orderId')
  async getPreference(@Param('orderId') orderId: string, @Req() req: any) {
    const order = await this.ordersRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Create a fresh MP preference and return the checkout URL
    const { preferenceId, initPoint } = await this.paymentsService.createPaymentPreference(order);
    return { preferenceId, initPoint };
  }
}
