import { IsString, IsUrl } from 'class-validator';

export class CreateAttachmentDto {
  @IsString()
  name: string;
  @IsString()
  @IsUrl()
  url: string;
}
