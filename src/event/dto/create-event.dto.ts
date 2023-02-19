import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
  Validate,
} from 'class-validator';
import { PriceEnum } from '../price.enum';
import { AppError } from '../../commons/errors/app-error';
import { Attachment } from '../../attachment/entities/attachment.entity';

export class CreateEventDto {
  @Validate(AppError, { message: 'this name is incorrect try the alphabet' })
  @IsString()
  @MinLength(2, {
    message: '2 characters is the minimum to put in the name',
  })
  name: string;
  @IsString()
  @MinLength(2, {
    message: '2 characters is the minimum to put in the category',
  })
  category: string;
  @IsString()
  @MinLength(2, {
    message: '2 characters is the minimum to put in the location',
  })
  location: string;
  // @Type(() => Date)
  @IsDateString()
  startDate: Date;
  // @Type(() => Date)
  @IsDateString()
  endDate: Date;
  @IsString()
  @IsOptional()
  @MinLength(8, {
    message: '8 characters is the minimum to put in the description',
  })
  description?: string;
  @IsNumber(
    { maxDecimalPlaces: 0 },
    { message: 'required_number_participants must be a number' },
  )
  @IsPositive({ message: 'required_number_participants must be a number' })
  @IsOptional()
  maxParticipants?: number;
  @IsNumber(
    { maxDecimalPlaces: 0 },
    { message: 'required_number_participants must be a number' },
  )
  @IsPositive({ message: 'required_number_participants must be a number' })
  @IsOptional()
  requiredNumberParticipants?: number;
  @IsNumber(
    { maxDecimalPlaces: 4 },
    { message: 'amount must have not more than 4 max numbers after comma' },
  )
  @IsPositive({ message: 'amount must be a positive number' })
  amount?: number;
  @IsEnum(PriceEnum, {
    message: 'this currency must be a valid currency',
  })
  currency?: PriceEnum;

  @IsOptional()
  attachments?: Attachment[];
  primaryAttachment: string;
}
