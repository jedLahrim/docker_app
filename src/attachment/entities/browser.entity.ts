import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Browser extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  // @Exclude()
  id: string;
  @Column({ default: null })
  team: string;
  @Column({ default: null })
  FirstName: string;
  @Column({ default: null })
  LastName: string;
  @Column({ default: null })
  AvatarThumb: string;
  @Column({ default: null })
  RecordingId: string;
  @Column({ default: null })
  RecordingMessage: string;
  @Column({ default: null })
  RecordingThumb: string;
  @Column({ default: null })
  RecordingVideo: string;
  @Column({ default: null })
  price: string;
  @Column({ default: null })
  status: string;
  @Column({ default: null })
  details: string;
  @Column({ default: null })
  ComingSoon: string;
  @Column({ default: null })
  hide: string;
  @Column({ default: null })
  RadioButtonVisible: string;
  @Column({ default: null })
  ConvertedRecording: string;
  @Column({ default: null })
  Messages: string;
  @Column({ default: null })
  internationals: string;
  @Column({ default: null })
  christmasMessages: string;
}
