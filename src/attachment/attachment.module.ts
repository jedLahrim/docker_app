import { Module } from '@nestjs/common';
import { AttachmentController } from './attachment.controller';
import { EventModule } from '../event/event.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attachment } from './entities/attachment.entity';
import { AttachmentService } from './attachment.service';
import { User } from '../auth/entities/user.entity';
import { Media } from './entities/media.entity';
import { Browser } from './entities/browser.entity';
import { Json } from './entities/json.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attachment, User, Media, Browser, Json]),
    EventModule,
    // UserModule,
  ],
  controllers: [AttachmentController],
  providers: [AttachmentService],
})
export class AttachmentModule {}
