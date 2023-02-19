import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './entities/event.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import {
  Asc,
  DateType,
  EventType,
  FilterEventDto,
} from './dto/filter-event.dto';
import { AppError } from '../commons/errors/app-error';
import { Pagination } from '../commons/pagination';
import {
  ERR_NOT_FOUND_ATTACHMENTS,
  ERR_NOT_FOUND_EVENT,
  ERR_NOT_FOUND_EVENTS,
  ERR_NOT_PRIMARY_ATTACHMENTS,
} from '../commons/errors/errors-codes';
import axios from 'axios';
import { UpdateEventDto } from './dto/update-event.dto';
import { Order } from '../stripe/order.entity';
import { ConfigService } from '@nestjs/config';
import { SharedEvent } from './entities/sharedEvent.entity';
import { Attachment } from '../attachment/entities/attachment.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private eventRepo: Repository<Event>,
    @InjectRepository(User)
    private userRepo: Repository<User>, // @Inject(forwardRef(() => UserService)) // private userService: UserService,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(SharedEvent)
    private sharedEventRepo: Repository<SharedEvent>,
    @InjectRepository(Attachment)
    private attachmentRepo: Repository<Attachment>,
    private configService: ConfigService,
  ) {}

  async create(dto: CreateEventDto, user: User): Promise<Event> {
    const {
      name,
      location,
      category,
      description,
      startDate,
      endDate,
      maxParticipants,
      requiredNumberParticipants,
      amount,
      currency,
      attachments,
      primaryAttachment,
    } = dto;
    if (startDate > endDate) {
      throw new ConflictException(
        new AppError(
          'ERROR_START_DATE_GRATER_END_DATE',
          'start date is grater than end date ',
        ),
      );
    }

    if (maxParticipants < requiredNumberParticipants) {
      throw new ConflictException(
        new AppError(
          'ERROR_MAX_PARTICIPANTS_GRATER_REQUIRED',
          'max participants grater than required number participants',
        ),
      );
    }
    const event = this.eventRepo.create({
      user,
      name,
      location,
      category,
      description,
      startDate: startDate,
      endDate: endDate,
      maxParticipants: maxParticipants,
      requiredNumberParticipants: requiredNumberParticipants,
      currency,
      amount,
    });
    /// Check primary attachment and assign it to event
    const foundedPrimaryAttachment = attachments.find(
      (value) => value.id == primaryAttachment,
    );
    if (foundedPrimaryAttachment) {
      event.imageUrl = foundedPrimaryAttachment.url;
      event.primaryAttachment = foundedPrimaryAttachment.id;
    } else {
      throw new NotFoundException(new AppError(ERR_NOT_FOUND_ATTACHMENTS));
    }

    /// save attachments
    event.attachments = await this.attachmentRepo.save(attachments);
    /// save event
    event.createdBy = user.id;
    const savedEvent = await this.eventRepo.save(event);
    savedEvent.amount = amount ? Number(amount.toFixed(2)) : null;
    return savedEvent;
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepo.findOne({
      where: { id: id },
      loadEagerRelations: true,
      relations: ['attachments', 'orders'],
    });
    if (!event) {
      throw new NotFoundException(
        new AppError('ERR_NOT_FOUND_EVENT', `Event with ID ${id} not found`),
      );
    }

    event.joinedUsers = await this._getJoinedUsers(event.id);
    return this.eventRepo.save(event);
  }

  private async _getJoinedUsers(eventId: string): Promise<User[]> {
    const query = this.userRepo.createQueryBuilder();
    return query
      .innerJoinAndSelect('order', 'order', 'order.userId=user.id')
      .where('order.eventId= :eventId', { eventId: eventId })
      .select('user.id,user.email,user.profile_picture')
      .groupBy('user.id')
      .getRawMany();
  }

  async findAll(
    filterDto: FilterEventDto,
    user: User,
  ): Promise<Pagination<Event>> {
    try {
      const {
        search,
        skip,
        take,
        startDateLte,
        startDateGte,
        eventType,
        endDateLte,
        endDateGte,
        sortBy,
        asc,
      } = filterDto;
      const query = this.eventRepo.createQueryBuilder('event');
      if (eventType == EventType.invited_event) {
        /// Get all events that shared with me
        /// TODO: Select * from event as t1 inner join shared_event as t2 on t1.id=t2.event.id where t2.user.id=user.id
        query
          .select('event')
          .innerJoinAndSelect('shared_event', 't2', 'event.id=t2.eventId')
          .where('t2.userId= :userId', { userId: user.id });
      }
      if (eventType == EventType.my_event) {
        query.select('event').andWhere('event.userId = :id ', { id: user.id });
      }

      if (startDateLte) {
        query.andWhere('event.start_date <= :startDateLte', {
          startDateLte: startDateLte,
        });
      }

      if (startDateGte) {
        query.andWhere('event.start_date >= :startDateGte', {
          startDateGte: startDateGte,
        });
      }

      if (endDateLte) {
        query.andWhere('event.end_date <= :endDateGte', {
          endDateLte: endDateLte,
        });
      }

      if (endDateGte) {
        query.andWhere('event.end_date >= :endDateGte', {
          endDateGte: endDateGte,
        });
      }

      if (search) {
        query.andWhere(
          '(LOWER(event.name) LIKE LOWER(:search) OR LOWER(event.location) LIKE LOWER(:search))',
          { search: `%${search}%` },
        );
        query.orderBy('event.name', 'ASC');
      }

      if (sortBy === DateType.start_date) {
        query.orderBy('event.start_date', asc === Asc.asc ? 'ASC' : 'DESC');
      } else if (sortBy === DateType.end_date) {
        query.orderBy('event.end_date', asc === Asc.asc ? 'ASC' : 'DESC');
      }

      // Pagination
      query.skip(skip ?? 0);
      query.take(take ?? 4);
      const [events, total] = await query.getManyAndCount();
      return new Pagination<Event>(events, total);
    } catch (e) {
      console.log(e);
      throw new NotFoundException(
        new AppError('INVALID_FIELDS', 'your filter fields is invalid'),
      );
    }
  }

  public async createLink(
    id: string,
    user: User,
    // res: Observable<any>,
  ): Promise<any> {
    const event = await this.eventRepo.findOneBy({ id: id });
    if (event) {
      console.log(event.id);
      const api_key = this.configService.get('API_KEY');
      const response = await axios({
        method: 'POST',
        url: `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${api_key}`,
        data: {
          dynamicLinkInfo: {
            domainUriPrefix: 'https://eventjed.page.link',
            link: `https://eventjed.com/event?event_id=${event.id}`,
            androidInfo: {
              androidPackageName: 'com.UeventApp.app',
            },
            iosInfo: {
              iosBundleId: 'com.UeventApp.app',
            },
            socialMetaTagInfo: {
              socialTitle: event.name,
              socialDescription: event.description,
              socialImageLink: event.imageUrl,
            },
          },
        },
      }).catch(() => {
        throw new ForbiddenException('API not available');
      });
      return { data: response.data };
    } else {
      throw new NotFoundException(new AppError(ERR_NOT_FOUND_EVENTS));
    }
  }

  async acceptShare(id: string, user: User) {
    const event = await this.eventRepo.findOneBy({ id });
    if (!event) {
      throw new NotFoundException(new AppError(ERR_NOT_FOUND_EVENT));
    }
    // check if am the owner of the event
    // if (user.id == event.created_by) return;
    const user2 = await this.userRepo.findOneBy({ id: event.createdBy });
    if (user.id == event.createdBy || user.id == user2.id) return;

    try {
      const sharedEvent = this.sharedEventRepo.create({
        event,
        user,
      });
      await this.sharedEventRepo.save(sharedEvent);
    } catch (e) {
      throw new ConflictException(
        new AppError('ERR', 'event doesnt shared successfully'),
      );
    }
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    /// TODO : check attachment!=null
    /// delete all attachments by eventId
    /// save all new attachments of the event IF attachments not empty list
    const {
      name,
      category,
      location,
      startDate,
      endDate,
      description,
      maxParticipants,
      requiredNumberParticipants,
      amount,
      currency,
      attachments,
      primaryAttachment,
    } = updateEventDto;

    /// check primary_attachment exist on attachments
    const foundedPrimaryAttachment = await this._checkPrimaryInAttachments(
      attachments,
      primaryAttachment,
    );
    if (attachments) await this._checkAttachmentsExist(attachments);

    /// update all primitive params of event.entity
    const updateResult = await this.eventRepo.update(id, {
      name,
      category,
      location,
      startDate: startDate,
      endDate: endDate,
      description,
      maxParticipants: maxParticipants,
      requiredNumberParticipants: requiredNumberParticipants,
      amount: amount ? Number(amount.toFixed(2)) : null,
      currency,
      primaryAttachment: foundedPrimaryAttachment.id,
    });
    if (updateResult.affected == null || updateResult.affected == 0) {
      throw new NotFoundException(new AppError(ERR_NOT_FOUND_EVENT));
    }

    /// get event with full relations
    const event = await this.eventRepo.findOne({
      where: { id },
      loadEagerRelations: true,
      relations: ['attachments'],
    });

    /// update attachments because only few functions that use DeepPartial<Entity>
    /// mean save can update event and all deeply relations
    /// like create, save, softRemove, recover but not update or others.
    /// we have 3 request now it's fine, but it could be reduced to 2
    if (attachments) {
      event.attachments = attachments;
      return await this.eventRepo.save(event);
    } else {
      return event;
    }
  }

  private async _checkPrimaryInAttachments(
    attachments: Attachment[],
    primary_attachment: string,
  ) {
    /// Check primary attachment and assign it to event
    const foundedPrimaryAttachment = attachments.find(
      (value) => value.id == primary_attachment,
    );
    if (!foundedPrimaryAttachment) {
      throw new NotFoundException(new AppError(ERR_NOT_PRIMARY_ATTACHMENTS));
    } else return foundedPrimaryAttachment;
  }

  async remove(id: string, user: User | any): Promise<void> {
    const result = await this.eventRepo.delete({ id, user });
    console.log(result);
    if (result.affected === 0) {
      throw new NotFoundException(
        new AppError(ERR_NOT_FOUND_EVENT, `Event with ID "${id}" not found`),
      );
    }
  }

  private async _checkAttachmentsExist(attachments: Attachment[]) {
    const ids = attachments.map((attachment) => attachment.id);
    const foundedAttachmentsCount = await this.attachmentRepo.countBy({
      id: In(ids),
    });
    if (attachments.length != foundedAttachmentsCount)
      throw new NotFoundException(new AppError(ERR_NOT_FOUND_ATTACHMENTS));
  }
}
