import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuoteRequest } from './quote-request.entity';
import { RequestOptica } from './request-optica.entity';
import { Quote } from '../quotes/quote.entity';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { UsersModule } from '../users/users.module';
import { OpticasModule } from '../opticas/opticas.module';
import { PrescriptionsModule } from '../prescriptions/prescriptions.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuoteRequest, RequestOptica, Quote]),
    UsersModule,
    OpticasModule,
    PrescriptionsModule,
    NotificationsModule,
    SettingsModule,
  ],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}
