import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDto } from '../../users/dto/create-user.dto';

export class RegisterDto extends CreateUserDto {
  // Optica-specific fields (optional, used when role === 'optica')
  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  cuit?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;

  // Medico-specific fields (optional, used when role === 'medico')
  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;
}
