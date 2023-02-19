import { Controller, Get } from '@nestjs/common';
import { SmsService } from './twilio/sms.service';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  getHello() {
    this.appService.getHello();
  }
}
