import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Prescription } from './prescription.entity';
import { PrescriptionsService } from './prescriptions.service';
import { PrescriptionsController } from './prescriptions.controller';
import { PrescriptionAiService } from './prescription-ai.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Prescription]),
    MulterModule.register({ dest: './uploads' }),
    UsersModule,
  ],
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService, PrescriptionAiService],
  exports: [PrescriptionsService],
})
export class PrescriptionsModule {}
