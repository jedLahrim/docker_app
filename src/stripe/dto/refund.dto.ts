import { IsString } from 'class-validator';

export class RefundDto {
  @IsString()
  orderId: string;
  @IsString({ message: 'you should put the reason of your refund' })
  reason: string;
}
