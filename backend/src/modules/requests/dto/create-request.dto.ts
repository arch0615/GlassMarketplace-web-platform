import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsIn,
  IsUUID,
  Min,
  Max,
  MinLength,
  MaxLength,
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

  // For non-receta service types: free-text description of the requested
  // service or product. Required when serviceType !== 'lentes_receta'; the
  // service layer enforces that rule.
  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  @IsIn(['masculino', 'femenino', 'otro', 'no_especifica'])
  gender?: string;

  @IsOptional()
  @IsString()
  @IsIn(['nino', 'nina', 'adulto'])
  patientType?: 'nino' | 'nina' | 'adulto';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(120)
  patientAge?: number;

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
