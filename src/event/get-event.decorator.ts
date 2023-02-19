import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Event } from './entities/event.entity';

export const GetEvent = createParamDecorator(
  (_data, ctx: ExecutionContext): Event => {
    const Req = ctx.switchToHttp().getRequest();
    return Req.event;
  },
);
