import { Controller, Post, Body, Logger } from '@nestjs/common';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  @Post('webhook')
  handleWebhook(@Body() payload: any) {
    this.logger.log(`[MP Webhook] Received: ${JSON.stringify(payload)}`);
    // TODO: verify MP webhook signature and process payment events
    return { received: true };
  }
}
