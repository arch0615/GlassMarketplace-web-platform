import { IsUUID, IsOptional, IsNumber, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @IsUUID()
  quoteId: string;

  @IsOptional()
  @IsUUID()
  selectedFrameId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  @IsIn(['full', 'deposit'])
  paymentMode?: string;

  @IsOptional()
  @IsString()
  @IsIn(['pickup', 'delivery'])
  deliveryMethod?: 'pickup' | 'delivery';

  @IsOptional()
  @IsString()
  deliveryAddress?: string;
}

