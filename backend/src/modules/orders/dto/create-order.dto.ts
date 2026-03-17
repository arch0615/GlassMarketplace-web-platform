import { IsUUID, IsOptional, IsNumber } from 'class-validator';
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
}
