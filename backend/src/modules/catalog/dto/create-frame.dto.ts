import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFrameDto {
  @IsUUID()
  opticaId: string;

  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsOptional()
  @IsString()
  material?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceMax?: number;

  @IsOptional()
  @IsArray()
  styleTags?: string[];

  @IsOptional()
  @IsBoolean()
  arReady?: boolean;

  @IsOptional()
  @IsString()
  arAssetUrl?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
