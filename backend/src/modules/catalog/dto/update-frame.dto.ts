import { PartialType } from '@nestjs/mapped-types';
import { CreateFrameDto } from './create-frame.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateFrameDto extends PartialType(CreateFrameDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
