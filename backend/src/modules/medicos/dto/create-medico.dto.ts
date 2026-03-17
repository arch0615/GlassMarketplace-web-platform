import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';

export class CreateMedicoDto {
  @IsUUID()
  userId: string;

  @IsString()
  fullName: string;

  @IsString()
  specialty: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsArray()
  obrasSociales?: string[];
}
