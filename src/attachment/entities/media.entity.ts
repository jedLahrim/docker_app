import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Media extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  // @Exclude()
  id: string;
  @Column({ default: null })
  outputVideo: string;
  @Column({ default: null })
  created_by: string;
  @Column({ default: null })
  pid: number;
  @CreateDateColumn()
  CreatedAt: Date;
  @UpdateDateColumn()
  UpdatedAt: Date;

  // buffer: ChildProcess;
}
