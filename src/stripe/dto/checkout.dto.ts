import { IsOptional, IsString } from 'class-validator';

export class CheckoutDto {
  @IsString()
  successUrl: string;
  @IsString()
  @IsOptional()
  cancelUrl?: string;
  @IsString()
  @IsOptional()
  eventId?: string;
}
