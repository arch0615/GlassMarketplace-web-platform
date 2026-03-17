import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medico } from './medico.entity';
import { MedicoLocation } from './medico-location.entity';
import { MedicoRating } from './medico-rating.entity';
import { MedicosService } from './medicos.service';
import { MedicosController } from './medicos.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Medico, MedicoLocation, MedicoRating]), UsersModule],
  controllers: [MedicosController],
  providers: [MedicosService],
  exports: [MedicosService],
})
export class MedicosModule {}
