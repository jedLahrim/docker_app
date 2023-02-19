import { ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import SmsController from './sms.controller';
import { SmsService } from './sms.service';

@Module({
  imports: [
    // ConfigModule,
    // TwilioModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (cfg: ConfigService) => ({
    //     accountSid: TWILIO_ACCOUNT_SID,
    //     authToken: TWILIO_AUTH_TOKEN,
    //   }),
    //   inject: [ConfigService],
    // }),
  ],
  controllers: [SmsController],
  providers: [SmsService, ConfigService],
})
export class SmsModule {}
