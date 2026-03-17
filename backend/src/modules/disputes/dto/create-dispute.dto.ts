import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateDisputeDto {
  @IsUUID()
  orderId: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
