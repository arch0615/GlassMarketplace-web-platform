import { IsOptional, IsString } from 'class-validator';

export class CreatePrescriptionDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
