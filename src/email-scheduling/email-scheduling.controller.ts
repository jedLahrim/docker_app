import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EmailSchedulingService } from './email-scheduling.service';
import EmailScheduleDto from './email-scheduling.dto';

@Controller('email-scheduling')
export default class EmailSchedulingController {
  constructor(
    private readonly emailSchedulingService: EmailSchedulingService,
  ) {}

  @Post('schedule')
  @UseGuards(AuthGuard('jwt'))
  async scheduleEmail(@Body() emailSchedule: EmailScheduleDto) {
    return await this.emailSchedulingService.scheduleEmail(emailSchedule);
  }
}
