import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SeedService } from './seed.service';

// Feature modules
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { SettingsModule } from './modules/settings/settings.module';
import { OpticasModule } from './modules/opticas/opticas.module';
import { MedicosModule } from './modules/medicos/medicos.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { RequestsModule } from './modules/requests/requests.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { OrdersModule } from './modules/orders/orders.module';
import { DisputesModule } from './modules/disputes/disputes.module';
import { AdminModule } from './modules/admin/admin.module';
import { StorageModule } from './modules/storage/storage.module';

@Module({
  imports: [
    // Global config — reads .env automatically
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Database — uses env vars via ConfigService
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USER', 'lensia'),
        password: config.get<string>('DB_PASSWORD', 'password'),
        database: config.get<string>('DB_NAME', 'lensia_db'),
        synchronize: true,
        autoLoadEntities: true,
        logging: false,
      }),
    }),

    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),

    // Cron scheduler
    ScheduleModule.forRoot(),

    // Global storage (S3 / local fallback)
    StorageModule,

    // Feature modules
    UsersModule,
    AuthModule,
    SettingsModule,
    OpticasModule,
    MedicosModule,
    PrescriptionsModule,
    CatalogModule,
    NotificationsModule,
    RequestsModule,
    QuotesModule,
    PaymentsModule,
    OrdersModule,
    DisputesModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SeedService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
