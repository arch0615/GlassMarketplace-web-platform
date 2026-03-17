import { IsIn, IsString } from 'class-validator';

export class ResolveDisputeDto {
  @IsString()
  @IsIn(['release', 'refund', 'correction'])
  decision: 'release' | 'refund' | 'correction';

  @IsString()
  adminDecision: string;
}
