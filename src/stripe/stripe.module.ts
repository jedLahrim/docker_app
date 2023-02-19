import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../event/entities/event.entity';
import { StripeController } from './stripe.controller';
import { Order } from './order.entity';
import { User } from '../auth/entities/user.entity';
import { Refund } from './entities/refund.entity';

@Module({
  /// third party or entity or modules
  imports: [TypeOrmModule.forFeature([Order, Event, User, Refund])],
  /// all services needed on the current module
  providers: [StripeService],
  /// all services needed on the export of the current module
  exports: [StripeService],
  controllers: [StripeController],
  /// controllers: the controllers of the current module
})
export class StripeModule {}
