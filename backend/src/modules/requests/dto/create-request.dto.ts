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
  @IsString()
  @IsIn(['lentes_receta', 'reparacion', 'lentes_contacto', 'liquidos_accesorios', 'otro'])
  serviceType: string;

  @IsOptional()
  @IsUUID()
  prescriptionId?: string;

  @IsOptional()
  @IsString()
  lensType?: string;

  @IsOptional()
  @IsString()
  observations?: string;

  @IsOptional()
  @IsString()
  @IsIn(['masculino', 'femenino', 'otro', 'no_especifica'])
  gender?: string;

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
