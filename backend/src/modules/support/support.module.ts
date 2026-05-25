import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportThread } from './support-thread.entity';
import { SupportMessage } from './support-message.entity';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupportThread, SupportMessage]),
    UsersModule,
    NotificationsModule,
  ],
  controllers: [SupportController],
  providers: [SupportService],
  exports: [SupportService],
})
export class SupportModule {}
