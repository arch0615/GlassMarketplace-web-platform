import { PartialType } from '@nestjs/mapped-types';
import { CreateMedicoDto } from './create-medico.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateMedicoDto extends PartialType(CreateMedicoDto) {
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
