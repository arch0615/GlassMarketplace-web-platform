import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsUUID,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuoteDto {
  @IsUUID()
  requestId: string;

  @IsUUID()
  opticaId: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalPrice?: number;

  @IsOptional()
  @IsString()
  lensDescription?: string;

  @IsOptional()
  @IsString()
  estimatedDays?: string;

  // 3-tier pricing
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tierBasicPrice?: number;

  @IsOptional()
  @IsString()
  tierBasicDesc?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tierRecommendedPrice?: number;

  @IsOptional()
  @IsString()
  tierRecommendedDesc?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tierPremiumPrice?: number;

  @IsOptional()
  @IsString()
  tierPremiumDesc?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsUUID(undefined, { each: true })
  frameIds?: string[];
}
