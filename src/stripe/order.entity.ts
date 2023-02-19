import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Exclude } from 'class-transformer';
import { Event } from '../event/entities/event.entity';
import { IsEnum, IsOptional } from 'class-validator';
import { Status } from './enum/status.enum';

@Entity()
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: null })
  @IsOptional()
  @Exclude()
  paymentIntent?: string;

  @Column({ default: null })
  @IsOptional()
  @Exclude()
  @IsEnum(Status, {
    message: 'this status must be a valid status',
  })
  status?: Status;

  @ManyToOne(() => User, (user) => user.orders, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @Exclude({ toPlainOnly: true })
  user: User;

  @ManyToOne(() => Event, (event) => event.orders, {
    eager: false,
    onDelete: 'CASCADE',
  })
  event: Event;
}
