import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/user.entity';
import { Order } from '../orders/order.entity';
import { Dispute } from '../disputes/dispute.entity';
import { QuoteRequest } from '../requests/quote-request.entity';
import { Optica } from '../opticas/optica.entity';
import { Medico } from '../medicos/medico.entity';
import { MedicoLocation } from '../medicos/medico-location.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Order, Dispute, QuoteRequest, Optica, Medico, MedicoLocation]),
    UsersModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
