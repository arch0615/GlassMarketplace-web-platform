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

  @Type(() => Number)
  @IsNumber()
  totalPrice: number;

  @IsOptional()
  @IsString()
  lensDescription?: string;

  @IsOptional()
  @IsString()
  estimatedDays?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsUUID(undefined, { each: true })
  frameIds?: string[];
}
