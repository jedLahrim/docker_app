import { IsString } from 'class-validator';

export class CreateFreeOrderDto {
  @IsString()
  eventId: string;
}
