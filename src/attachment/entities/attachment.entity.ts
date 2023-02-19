import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Event } from '../../event/entities/event.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Attachment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  // @Exclude()
  id: string;
  @Column({ default: null })
  name: string;
  @Column({ default: null })
  url: string;

  @ManyToOne((_type) => Event, (event) => event.attachments, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @Exclude({ toPlainOnly: true })
  event: Event;
}
