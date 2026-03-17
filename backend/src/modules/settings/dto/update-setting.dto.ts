import { IsString } from 'class-validator';

export class UpdateSettingDto {
  @IsString()
  key: string;

  @IsString()
  value: string;
}
