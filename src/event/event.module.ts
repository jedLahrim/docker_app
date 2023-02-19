import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { UserModule } from '../auth/user.module';
import { PassportModule } from '@nestjs/passport';
import { User } from '../auth/entities/user.entity';
import { Order } from '../stripe/order.entity';
import { SharedEvent } from './entities/sharedEvent.entity';
import { Attachment } from '../attachment/entities/attachment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, User, Order, SharedEvent, Attachment]),
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
