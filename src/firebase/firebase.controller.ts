import { Body, Controller, Post } from '@nestjs/common';
import { FirebaseDynamicLinksService } from './firebase-dynamic-links.service';
import {
  ShortLinkRequestBody,
  ShortLinkResponse,
} from './types/short-link-api';

@Controller('firebase')
export class FirebaseController {
  constructor(
    private readonly firebaseDynamicLinks: FirebaseDynamicLinksService,
  ) {}

  @Post()
  async createLink(
    @Body() body: ShortLinkRequestBody,
  ): Promise<ShortLinkResponse> {
    return await this.firebaseDynamicLinks.createLink(body);
  }

  // @Get()
  // async getLink(
  //   @Body() body: ShortLinkRequestBody
  // ): Promise<ShortLinkResponse> {
  //   return await this.firebaseDynamicLinks.getLinkStats(body,);
  // }
}
