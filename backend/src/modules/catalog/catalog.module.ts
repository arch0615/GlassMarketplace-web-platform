import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Frame } from './frame.entity';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { OpticasModule } from '../opticas/opticas.module';

@Module({
  imports: [TypeOrmModule.forFeature([Frame]), OpticasModule],
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
