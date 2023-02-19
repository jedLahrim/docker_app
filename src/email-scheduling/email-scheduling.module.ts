import { Module } from '@nestjs/common';
import { EmailSchedulingService } from './email-scheduling.service';
import EmailSchedulingController from './email-scheduling.controller';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.sendgrid.net',
        auth: {
          user: 'apikey',
          pass: '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',
        },
      },
    }),
  ],
  controllers: [EmailSchedulingController],
  providers: [EmailSchedulingService],
})
export class EmailSchedulingModule {}
