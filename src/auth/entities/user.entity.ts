import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { MyCode } from '../../code/code.entity';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @Column()
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password is too weak',
  })
  @Exclude()
  password: string;

  @Column({ default: null })
  profilePicture?: string;

  @Column({ default: false })
  @Exclude()
  activated?: boolean;

  @OneToMany((_type) => MyCode, (code) => code.user, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @Exclude()
  code: MyCode[];



  access: string;
  refresh: string;
  refresh_expire_at: Date;
  access_expire_at: Date;

  @Column({ default: null })
  @IsOptional()
  @Exclude()
  customerId?: string;
}
