import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private resend: Resend | null = null;
  private fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromAddress = this.configService.get<string>('RESEND_FROM', 'Lensia <onboarding@resend.dev>');

    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log(`Email transport configured (Resend, from=${this.fromAddress})`);
    } else {
      this.logger.warn('RESEND_API_KEY not set — emails will be logged only');
    }
  }

  async sendEmail(to: string, subject: string, body: string, options: { throwOnError?: boolean } = {}): Promise<void> {
    this.logger.log(`[EMAIL] To: ${to} | Subject: ${subject}`);

    if (!this.resend) {
      this.logger.log(`[EMAIL] Body: ${body}`);
      return;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromAddress,
        to,
        subject,
        html: body,
      });
      if (error) {
        throw new Error(`${error.name}: ${error.message}`);
      }
      this.logger.log(`[EMAIL] Sent successfully to ${to} (id=${data?.id})`);
    } catch (error) {
      this.logger.error(`[EMAIL] Failed to send to ${to}: ${error.message}`);
      if (options.throwOnError) {
        throw error;
      }
    }
  }

  async sendRawEmail(to: string, subject: string, html: string, options: { throwOnError?: boolean } = {}): Promise<void> {
    return this.sendEmail(to, subject, html, options);
  }

  async notifyOrderStatus(order: { id: string; client?: { email?: string; fullName?: string } }, newStatus: string): Promise<void> {
    const to = order.client?.email || 'unknown';
    const name = order.client?.fullName || 'Cliente';
    const statusLabels: Record<string, string> = {
      payment_pending: 'Pendiente de pago',
      payment_held: 'Pago recibido',
      in_process: 'En proceso',
      delivered: 'Entregado',
      completed: 'Completado',
      dispute: 'En disputa',
      refunded: 'Reembolsado',
      cancelled: 'Cancelado',
    };
    const label = statusLabels[newStatus] || newStatus;

    const subject = `Lensia — Tu pedido fue actualizado: ${label}`;
    const body = `
      <div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1E40AF; margin-bottom: 16px;">Lensia</h2>
        <p>Hola ${name},</p>
        <p>Tu pedido <strong>#${order.id.slice(0, 8)}</strong> fue actualizado a:</p>
        <div style="background: #EFF6FF; border-radius: 8px; padding: 12px 16px; margin: 16px 0; font-size: 18px; font-weight: 600; color: #1E40AF;">
          ${label}
        </div>
        <p style="color: #64748B; font-size: 14px;">Ingresá a tu panel para ver los detalles.</p>
      </div>
    `;

    await this.sendEmail(to, subject, body);
  }

  async notifyOpticaNewRequest(opticaEmail: string, requestId: string): Promise<void> {
    const subject = 'Lensia — Nueva solicitud de presupuesto asignada';
    const body = `
      <div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1E40AF; margin-bottom: 16px;">Lensia</h2>
        <p>Tenés una nueva solicitud de presupuesto asignada.</p>
        <p>ID de solicitud: <strong>#${requestId.slice(0, 8)}</strong></p>
        <p>Ingresá a tu panel de óptica para revisar los detalles y enviar tu presupuesto.</p>
        <p style="color: #64748B; font-size: 14px;">Respondé lo antes posible para mejorar tu tasa de respuesta.</p>
      </div>
    `;

    await this.sendEmail(opticaEmail, subject, body);
  }

  async notifyAdminNewRequest(
    adminEmail: string,
    params: { requestId: string; clientName?: string; opticasNotified: number },
  ): Promise<void> {
    const subject = 'Lensia — Nueva solicitud de presupuesto';
    const body = `
      <div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1E40AF; margin-bottom: 16px;">Lensia · Admin</h2>
        <p>Un cliente cargó una nueva solicitud de presupuesto.</p>
        <div style="background: #F8FAFC; border-radius: 8px; padding: 12px 16px; margin: 16px 0; font-size: 14px;">
          <p style="margin: 0 0 4px 0;"><strong>ID:</strong> #${params.requestId.slice(0, 8)}</p>
          ${params.clientName ? `<p style="margin: 0 0 4px 0;"><strong>Cliente:</strong> ${params.clientName}</p>` : ''}
          <p style="margin: 0;"><strong>Ópticas notificadas:</strong> ${params.opticasNotified}</p>
        </div>
        <p style="color: #64748B; font-size: 14px;">Ingresá al panel admin para ver el detalle.</p>
      </div>
    `;

    await this.sendEmail(adminEmail, subject, body);
  }
}
