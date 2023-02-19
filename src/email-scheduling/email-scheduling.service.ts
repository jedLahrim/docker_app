import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { MailerService } from '@nestjs-modules/mailer';
import EmailScheduleDto from './email-scheduling.dto';
import { CronJob } from 'cron';

@Injectable()
export class EmailSchedulingService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  // @Cron('0 30 11 * * 6,7') //  11:30:00 on Saturday, and Sunday,
  // log() {
  //   console.log('Hello world!');
  // }

  async scheduleEmail(emailSchedule: EmailScheduleDto): Promise<any> {
    var cron = require('node-cron');
    // const job = new cron.CronJob(
    //   '0 00 19 * * 2',
    //   await this.sendMail(emailSchedule),
    // );

    const job: CronJob = cron.schedule('0 30 11 * * 7', () => {
      return this.mailerService.sendMail({
        to: emailSchedule.recipient,
        from: 'Contact@boostifly.com',
        subject: emailSchedule.subject,
        text: emailSchedule.content,
        sender: 'Contact@boostifly.com',
        //html: `Click <a href="${url}">here</a> to activate your account !`,
      });
    });

    this.schedulerRegistry.addCronJob(
      `${Date.now()}-${emailSchedule.subject}`,
      job,
    );
    job.start();
  }
}
