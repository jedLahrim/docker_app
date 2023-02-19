import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Json extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  // @Exclude()
  id: string;
  @Column()
  trigger: string;
  @Column()
  ActionType: string;
  @Column({ default: null })
  ActionSelector: String;
}
