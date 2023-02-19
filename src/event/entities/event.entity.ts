import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ArrayMaxSize, IsOptional, MaxLength } from 'class-validator';
import { User } from '../../auth/entities/user.entity';
import { Exclude } from 'class-transformer';
import { Order } from '../../stripe/order.entity';
import { SharedEvent } from './sharedEvent.entity';
import { PriceEnum } from '../price.enum';
import { Attachment } from '../../attachment/entities/attachment.entity';

@Entity()
export class Event extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column()
  category: string;
  @Column()
  location: string;
  @Column()
  startDate: Date;
  @Column()
  endDate: Date;
  @Column({ default: null })
  @IsOptional()
  description?: string;
  @Column({ default: null })
  @IsOptional()
  maxParticipants?: number;
  @Column({ default: null })
  @IsOptional()
  requiredNumberParticipants?: number;
  @Column({ type: 'double' })
  @IsOptional()
  amount?: number;
  @Column()
  @IsOptional()
  currency?: PriceEnum;
  @Column({ default: 0 })
  @IsOptional()
  joinedNumberParticipants?: number;
  @Column({ default: null })
  @IsOptional()
  primaryAttachment?: string;
  @Column({ default: null })
  @IsOptional()
  imageUrl?: string;
  @Column({ default: null })
  createdBy?: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ManyToOne((_type) => User, (user) => user.event, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @Exclude({ toPlainOnly: true })
  user: User;

  @OneToMany((_type) => Order, (order) => order.event, {
    eager: true,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @Exclude()
  orders: Order[];

  @OneToMany((_type) => SharedEvent, (sharedEvent) => sharedEvent.event, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  sharedEvent: SharedEvent[];

  @OneToMany((_type) => Attachment, (attachment) => attachment.event, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @ArrayMaxSize(10)
  @MaxLength(10)
  // @Exclude({ toPlainOnly: true })
  attachments: Attachment[];
  // @Exclude()
  joinedUsers: User[];
}

// @Column({ type: 'double precision' })
// lat: number;
//
// @Column({ type: 'double precision' })
// long: number;
