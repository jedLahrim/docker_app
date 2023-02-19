import {
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { User } from '../auth/entities/user.entity';
import { GetUser } from '../auth/get-user.decorator';
import { UserService } from '../auth/user.service';
import { FilterEventDto } from './dto/filter-event.dto';
import { Event } from './entities/event.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetEvent } from './get-event.decorator';
import { Pagination } from '../commons/pagination';

@Controller('event')
// @UseGuards(AuthGuard('jwt'))
export class EventController {
  constructor(
    private readonly eventService: EventService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createEventDto: CreateEventDto, @GetUser() user: User) {
    return this.eventService.create(createEventDto, user);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(
    @Query() filterDto: FilterEventDto,
    @GetUser() user: User,
  ): Promise<Pagination<Event>> {
    return this.eventService.findAll(filterDto, user);
  }

  @Get('/:id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(
    @Param('id') id: string,
    @GetUser() user: User,
    @GetEvent() event: Event,
  ): Promise<Event> {
    return this.eventService.findOne(id);
  }

  @Post('shared-link/:id')
  @UseGuards(AuthGuard('jwt'))
  async createLink(@Param('id') id: string, @GetUser() user: User) {
    return await this.eventService.createLink(id, user);
  }

  @Post('/:id/accept_share')
  @UseGuards(AuthGuard('jwt'))
  async acceptShare(@Param('id') id: string, @GetUser() user: User) {
    return await this.eventService.acceptShare(id, user);
  }

  // @Get('/get/getAll')
  // @UseGuards(AuthGuard('jwt'))
  // getLink(@GetUser() user: User, @Query() filterFto: FilterEventDto) {
  //   return this.eventService.getAll(user, filterFto);
  // }

  @Patch('/:id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @GetUser() user: User,
  ): Promise<Event> {
    return this.eventService.update(id, updateEventDto);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string, @GetUser() user: User): Promise<void> {
    return this.eventService.remove(id, user);
  }
}
