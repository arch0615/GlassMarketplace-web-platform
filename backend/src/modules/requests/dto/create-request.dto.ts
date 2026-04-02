import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsIn,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRequestDto {
  @IsOptional()
  @IsUUID()
  prescriptionId?: string;

  @IsString()
  @IsIn(['monofocal', 'bifocal', 'progresivo', 'filtro_azul', 'progressive', 'blue_filter'])
  lensType: string;

  @IsOptional()
  @IsString()
  priceRangeMin?: string;

  @IsOptional()
  @IsString()
  priceRangeMax?: string;

  @IsOptional()
  @IsArray()
  stylePreferences?: string[];

  @Type(() => Number)
  @IsNumber()
  clientLat: number;

  @Type(() => Number)
  @IsNumber()
  clientLng: number;
}
