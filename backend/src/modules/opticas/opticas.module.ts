import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Optica } from './optica.entity';
import { OpticaRating } from './optica-rating.entity';
import { OpticasService } from './opticas.service';
import { OpticasController } from './opticas.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Optica, OpticaRating]), UsersModule],
  controllers: [OpticasController],
  providers: [OpticasService],
  exports: [OpticasService],
})
export class OpticasModule {}
