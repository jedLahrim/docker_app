import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/entities/user.entity';
import { SmsService } from './sms.service';

@Controller('sms')
@UseInterceptors(ClassSerializerInterceptor)
export default class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('initiate-verification')
  @UseGuards(AuthGuard('jwt'))
  async sendSMS(
    @GetUser() user: User,
    @Body() phone_number: string,
  ): Promise<any> {
    if (!user) {
      throw new BadRequestException('Phone number already confirmed');
    }
    return await this.smsService.sendSMS(phone_number);
  }
}
