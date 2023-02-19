import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
} from './contstants';
import twilio from 'twilio';

@Injectable()
export class SmsService {
  public constructor() {
    // private readonly twilioService: TwilioService, // private readonly configService: ConfigService,
    // const accountSid = configService.get(TWILIO_ACCOUNT_SID);
    // const authToken = configService.get(TWILIO_AUTH_TOKEN);
  }

  async sendSMS(phoneNumber: any) {
    console.log(phoneNumber.phone_number);
    try {
      const sendSms = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      await sendSms.messages.create({
        body: 'Hello amine from your EVENT APP',
        from: TWILIO_PHONE_NUMBER,
        to: phoneNumber.phone_number,
      });
      return;
    } catch (e) {
      throw new InternalServerErrorException('the phone number is incorrect');
    }
  }
}
