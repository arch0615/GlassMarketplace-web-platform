import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { CreateRequestDto } from './create-request.dto';

/**
 * Extends the standard CreateRequestDto with the guest contact info we
 * need so the user can be notified when a quote arrives, even before
 * they've created an account.
 */
export class CreateAnonymousRequestDto extends CreateRequestDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  guestName: string;

  @IsEmail()
  guestEmail: string;

  // Loose phone validation — accept "+54 11 1234-5678" style.
  @IsString()
  @Matches(/^[+0-9()\-\s]{6,30}$/, {
    message: 'Ingresá un teléfono válido (ej: +54 11 1234-5678).',
  })
  guestPhone: string;
}
