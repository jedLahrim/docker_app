import { IsString } from 'class-validator';

export class UpdateAttachmentDto {
  @IsString()
  name: string;
}
