import { PartialType } from '@nestjs/mapped-types';
import { CreateOpticaDto } from './create-optica.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateOpticaDto extends PartialType(CreateOpticaDto) {
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsString()
  subscriptionTier?: string;
}
