import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsIn,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  fullName: string;

  @IsOptional()
  @IsIn(['cliente', 'optica', 'medico', 'admin'])
  role?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  // Datos de facturación (AR)
  @IsOptional()
  @IsString()
  @Matches(/^\d{11}$/, { message: 'CUIT debe tener 11 dígitos' })
  cuit?: string;

  @IsOptional()
  @IsString()
  razonSocial?: string;

  @IsOptional()
  @IsIn(['consumidor_final', 'responsable_inscripto', 'monotributista', 'exento'])
  invoiceCondition?: 'consumidor_final' | 'responsable_inscripto' | 'monotributista' | 'exento';
}
