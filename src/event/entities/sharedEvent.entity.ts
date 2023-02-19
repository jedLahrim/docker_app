import { BaseEntity, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Event } from './event.entity';
import { User } from '../../auth/entities/user.entity';

@Entity()
export class SharedEvent extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event, (event) => event.sharedEvent, {
    eager: false,
    onDelete: 'CASCADE',
  })
  event: Event;

  @ManyToOne(() => User, (user) => user.sharedEvents, {
    eager: false,
    onDelete: 'CASCADE',
  })
  user: User;
}
