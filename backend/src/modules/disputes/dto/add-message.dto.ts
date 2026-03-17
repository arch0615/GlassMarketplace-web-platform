import { IsString } from 'class-validator';

export class AddMessageDto {
  @IsString()
  message: string;
}
