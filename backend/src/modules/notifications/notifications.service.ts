import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter | null = null;
  private fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    this.fromAddress = this.configService.get<string>('SMTP_FROM', 'no-reply@lensia.pro');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        // Force IPv4 — the VPS can't route IPv6 to Gmail
        tls: { servername: host },
        ...({ family: 4 } as any),
      } as any);
      this.logger.log(`Email transport configured (${host}:${port})`);
    } else {
      this.logger.warn('SMTP not configured — emails will be logged only');
    }
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    this.logger.log(`[EMAIL] To: ${to} | Subject: ${subject}`);

    if (!this.transporter) {
      this.logger.log(`[EMAIL] Body: ${body}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject,
        html: body,
      });
      this.logger.log(`[EMAIL] Sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`[EMAIL] Failed to send to ${to}: ${error.message}`);
    }
  }

  async sendRawEmail(to: string, subject: string, html: string): Promise<void> {
    return this.sendEmail(to, subject, html);
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
}
