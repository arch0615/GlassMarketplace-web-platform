import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    this.logger.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
    this.logger.log(`[EMAIL] Body: ${body}`);
    // TODO: integrate with real email provider (SES, SendGrid, etc.)
  }

  async notifyOrderStatus(order: { id: string; client?: { email?: string } }, newStatus: string): Promise<void> {
    const to = order.client?.email || 'unknown';
    const subject = `Order ${order.id} status update: ${newStatus}`;
    const body = `Your order ${order.id} has been updated to status: ${newStatus}.`;
    await this.sendEmail(to, subject, body);
  }

  async notifyOpticaNewRequest(opticaEmail: string, requestId: string): Promise<void> {
    const subject = 'New prescription quote request assigned to you';
    const body = `You have been assigned a new quote request (ID: ${requestId}). Please log in to respond.`;
    await this.sendEmail(opticaEmail, subject, body);
  }
}
