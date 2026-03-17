import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsIn,
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
}
