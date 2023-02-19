import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from '../event/entities/event.entity';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { AppError } from '../commons/errors/app-error';
import { ERR_NOT_FOUND_EVENT } from '../commons/errors/errors-codes';

@Injectable()
export class ApiService {
  constructor(
    @InjectRepository(Event)
    private eventRepo: Repository<Event>,
    private http: HttpService,
  ) {}

  // async createLink(
  //   id: string,
  //   body: ShortLinkRequestBody,
  //   // res: Observable<any>,
  // ): Promise<ShortLinkResponse | Event | any> {
  //   // const event = await this.findOne(id)
  //   // console.log(event.id);
  //   const event_id = '7140fae2-8008-4bf1-a824-1c0e25800c9b';
  //   const response = await axios({
  //     method: 'POST',
  //     url: `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${api_key}`,
  //     data:{
  //       "dynamicLinkInfo": {
  //         "domainUriPrefix": "https://eventjed.page.link",
  //         "link": "https://eventjed.com/event?event_id={{event_id}}",
  //         "androidInfo": {
  //           "androidPackageName": "com.UeventApp.app"
  //         },
  //         "iosInfo": {
  //           "iosBundleId": "com.UeventApp.app"
  //         },
  //         "socialMetaTagInfo": {
  //           "socialTitle": "Event title",
  //           "socialDescription": "Event description Here",
  //           "socialImageLink": "https://i.ibb.co/wQzSrx0/event7.png"
  //         }
  //       }
  //     }
  //   }).catch(() => {
  //     throw new ForbiddenException('API not available');
  //   });

  async findOne(id: string | any, user?: User | any): Promise<Event> {
    const found = await this.eventRepo.findOneBy({ id, user });
    if (!found) {
      throw new NotFoundException(
        new AppError(ERR_NOT_FOUND_EVENT, `Event with ID "${id}" not found`),
      );
    }
    return found;
  }
}
