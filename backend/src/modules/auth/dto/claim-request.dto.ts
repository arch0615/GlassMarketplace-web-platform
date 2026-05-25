import { IsString, MinLength, MaxLength } from 'class-validator';

export class ClaimRequestDto {
  @IsString()
  @MinLength(16)
  claimToken: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}
