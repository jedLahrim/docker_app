import {
  Body,
  Controller,
  forwardRef,
  Get,
  Inject,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EventService } from '../event/event.service';
import { User } from '../auth/entities/user.entity';
import { GetUser } from '../auth/get-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { AttachmentService } from './attachment.service';
import { AuthGuard } from '@nestjs/passport';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';

@Controller('attachment')
export class AttachmentController {
  constructor(
    private readonly attachmentService: AttachmentService,
    @Inject(forwardRef(() => EventService))
    private readonly eventService: EventService,
  ) {}

  //
  // @Post("/:id")
  // // @UseGuards(AuthGuard('jwt'))
  // async create(
  //   @Body() createAttachmentDto: CreateAttachmentDto,
  //   @Param("id") id: string,
  //   @GetUser() user: User,
  //   event: Event
  // ): Promise<Event | Attachment | any> {
  //   return await this.attachmentService.createAttachment(
  //     createAttachmentDto,
  //     id
  //   );
  // }

  // @Get(":id")
  // findOne(@Param("id") id: string) {
  //   return this.attachmentService.findOne(+id);
  // }

  @Post('/:upload')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadAttachmentDto: UploadAttachmentDto,
    @GetUser() user: User,
  ) {
    return await this.attachmentService.upload(file, uploadAttachmentDto, user);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async uploads(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
  ) {
    return await this.attachmentService.uploads(file, user);
  }

  @Post('/:upload/upload_from_file')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async uploadFromFile(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
  ) {
    return await this.attachmentService.uploadFromFile(file, user);
  }

  @Get()
  @UseInterceptors(FileInterceptor('file'))
  async fetch() {
    return await this.attachmentService.fetch();
  }

  // @Delete(":id")
  // remove(@Param("id") id: string) {
  //   return this.attachmentService.remove(+id);
  // }
}
