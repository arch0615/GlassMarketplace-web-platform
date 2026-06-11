import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as twilio from 'twilio';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private resend: Resend | null = null;
  private fromAddress: string;

  // Twilio WhatsApp transport. Optional — works fine without it (we just
  // log a warning and skip WA sends). Lets us ship the integration even
  // before Meta has approved production templates.
  private twilioClient: ReturnType<typeof twilio> | null = null;
  private twilioWaFrom: string | null = null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromAddress = this.configService.get<string>('RESEND_FROM', 'Lensia <onboarding@resend.dev>');

    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log(`Email transport configured (Resend, from=${this.fromAddress})`);
    } else {
      this.logger.warn('RESEND_API_KEY not set — emails will be logged only');
    }

    const twilioSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const twilioToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    const twilioWaFrom = this.configService.get<string>('TWILIO_WA_FROM');
    if (twilioSid && twilioToken && twilioWaFrom) {
      this.twilioClient = twilio(twilioSid, twilioToken);
      this.twilioWaFrom = twilioWaFrom;
      this.logger.log(`WhatsApp transport configured (Twilio, from=${twilioWaFrom})`);
    } else {
      this.logger.warn('TWILIO_* not set — WhatsApp notifications will be logged only');
    }
  }

  /**
   * Send a WhatsApp message. Best-effort: failures are logged and don't
   * throw, so a Meta-rejected template (e.g. outside the 24h freeform
   * window during trial) never blocks the email channel.
   *
   * For trial accounts the recipient MUST be a verified number in the
   * Twilio sandbox; otherwise the call returns a 21608 error which we
   * silently log.
   */
  async sendWhatsApp(to: string, body: string): Promise<void> {
    if (!to) return;
    if (!this.twilioClient || !this.twilioWaFrom) {
      this.logger.log(`[WA] (no transport) To: ${to} | Body: ${body.slice(0, 80)}…`);
      return;
    }
    const normalized = to.startsWith('whatsapp:') ? to : `whatsapp:${this.toE164(to)}`;
    try {
      const msg = await this.twilioClient.messages.create({
        from: this.twilioWaFrom,
        to: normalized,
        body,
      });
      this.logger.log(`[WA] Sent to ${normalized} (sid=${msg.sid}, status=${msg.status})`);
    } catch (err: any) {
      this.logger.warn(`[WA] Failed to ${normalized}: ${err?.message || err}`);
    }
  }

  /**
   * Normalize a user-entered phone to E.164 for WhatsApp routing.
   *
   * Argentine numbers MUST go through +54 9 <area> <number> on WhatsApp.
   * Users in our app may type their phone in any of these forms — we
   * always end up emitting the same canonical "+549..." for AR mobiles:
   *
   *   "+54 9 2302 54-2518" → +5492302542518   (already correct)
   *   "+54 2302 54-2518"   → +5492302542518   (had country, missing 9)
   *   "2302542518"         → +5492302542518   (no country at all)
   *   "+1 555 0123"        → +15550123        (foreign — leave alone)
   *
   * Without the "9" the WA send returns queued but is silently never
   * delivered, which is the bug we hit in May 2026.
   */
  private toE164(input: string): string {
    let digits = String(input).replace(/[^\d+]/g, '');
    const hadPlus = digits.startsWith('+');
    if (hadPlus) digits = digits.slice(1);

    if (!hadPlus && !digits.startsWith('54')) {
      // No country prefix at all → assume AR mobile.
      digits = '549' + digits;
    } else if (digits.startsWith('54') && !digits.startsWith('549')) {
      // Has country code but missing the WhatsApp "9".
      digits = '549' + digits.slice(2);
    }

    return '+' + digits;
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

  async notifyOrderStatus(
    order: { id: string; client?: { email?: string; fullName?: string; phone?: string; whatsappOptOut?: boolean } },
    newStatus: string,
  ): Promise<void> {
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

    // WhatsApp mirror — best-effort, respects opt-out flag.
    if (order.client?.phone && !order.client?.whatsappOptOut) {
      const waBody = `Lensia: tu pedido #${order.id.slice(0, 8)} cambió a «${label}». Detalle: https://lensia.pro/cliente/pedidos`;
      this.sendWhatsApp(order.client.phone, waBody).catch(() => {});
    }
  }

  async notifyOpticaNewRequest(
    opticaEmail: string,
    requestId: string,
    opticaPhone?: string,
    opticaName?: string,
  ): Promise<void> {
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

    // WhatsApp mirror.
    if (opticaPhone) {
      const waBody = `Hola ${opticaName || ''}, tenés una nueva solicitud de presupuesto en Lensia. Respondela acá: https://lensia.pro/optica/solicitudes`;
      this.sendWhatsApp(opticaPhone, waBody).catch(() => {});
    }
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
