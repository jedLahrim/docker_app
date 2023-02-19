import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class MyCode extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  code: string;
  @Column()
  expireAt: Date;

  @ManyToOne(() => User, (user) => user.code, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_user_id',
  })
  @Exclude({ toPlainOnly: true })
  user: User;
  @RelationId((code: MyCode) => code.user)
  userId: string;
}
