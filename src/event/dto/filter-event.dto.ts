import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export enum EventType {
  invited_event = 'INVITED_EVENTS',
  my_event = 'MY_EVENTS',
}

export enum Asc {
  asc = 'asc',
  desc = 'desc',
}

export enum DateType {
  start_date = 'START_DATE',
  end_date = 'END_DATE',
}

export class FilterEventDto {
  @IsOptional()
  @IsEnum(EventType, {
    message: 'this event type is invalid',
  })
  eventType?: EventType;
  @IsOptional()
  @IsString()
  search?: string;
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDateLte?: Date;
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDateGte?: Date;
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDateLte?: Date;
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDateGte?: Date;
  @IsOptional()
  @IsEnum(DateType, {
    message: 'this date type is invalid',
  })
  sortBy: string;
  @IsOptional()
  @IsEnum(Asc, {
    message: 'this field type is invalid',
  })
  asc?: string;
  @IsOptional()
  skip?: number;
  @IsOptional()
  take?: number;
}
