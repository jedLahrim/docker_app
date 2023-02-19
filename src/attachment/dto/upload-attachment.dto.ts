import { IsString } from 'class-validator';

export class UploadAttachmentDto {
  @IsString()
  name: string;
}
