import { ConflictException, HttpException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Attachment } from './entities/attachment.entity';
import { User } from '../auth/entities/user.entity';
import { ERR_UPLOAD_FAILED } from '../commons/errors/errors-codes';
import { AppError } from '../commons/errors/app-error';
import { ConfigService } from '@nestjs/config';
import {
  AbortMultipartUploadCommand,
  PutObjectCommandInput,
  S3,
} from '@aws-sdk/client-s3';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';
import { v4 as uuid } from 'uuid';
import { promises as fs } from 'fs';
import { ChildProcess, exec } from 'child_process';
import { Media } from './entities/media.entity';
import * as path from 'path';
import { readFile } from 'xlsx';
import { Browser } from './entities/browser.entity';
import { Json } from './entities/json.entity';

@Injectable()
export class AttachmentService {
  constructor(
    @InjectRepository(Attachment)
    private attachmentRepo: Repository<Attachment>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Media)
    private mediaRepo: Repository<Media>,
    @InjectRepository(Browser)
    private browserRepo: Repository<Browser>,
    @InjectRepository(Json)
    private jsonRepo: Repository<Json>,
    private configService: ConfigService,
  ) {}

  // async createAttachment(
  //   createAttachmentDto: CreateAttachmentDto,
  //   id?: string,
  //   event?: Event,
  //   user?: User | any,
  // ): Promise<Event & any> {
  //   try {
  //     const { name, url } = createAttachmentDto;
  //     const attachment = this.attachmentRepo.create({
  //       name,
  //       url,
  //       event,
  //     });
  //
  //     event = await this.eventRepo.findOneBy({ id, user });
  //
  //     // console.log(event);
  //     if (!event) {
  //       throw new NotFoundException(`event with ID "${id}" not found`);
  //     } else {
  //       attachment.event_id = id;
  //       await this.attachmentRepo.save(attachment);
  //       const r = event.attachment.push(attachment);
  //       event.attachment.length = 10;
  //       await this.eventRepo.save(event);
  //       console.log(r);
  //       await this.attachmentRepo.save(attachment);
  //       console.log(attachment);
  //       await this.eventRepo.save(event);
  //       const primary_att = event.attachment.find((element, index: 0) => {
  //         console.log(index);
  //         console.log(element.id);
  //         event.primary_attachment = element.id;
  //         console.log(element.id);
  //         event.image_url = element.url;
  //         return this.eventRepo.save(event);
  //       });
  //       console.log(primary_att);
  //       return attachment;
  //     }
  //   } catch (e) {
  //     // console.log(e);
  //     if (e.code == 'ER_BAD_NULL_ERROR') {
  //       throw new ConflictException(
  //         new AppError(
  //           ERR_10_MAX_ATTACHMENT_IN_EVENT_CODE,
  //           'you cant have more than 10 attachment in your event ',
  //         ),
  //       );
  //     }
  //   }
  // }

  // uploads a file to s3
  async uploads(file: Express.Multer.File, user: User): Promise<void> {
    // upload to AWS
    const sendData = await this._uploadAwsFile(file, user);
    // save attachment after upload
    // const { name } = uploadAttachmentDto;
    // const attachment = this.attachmentRepo.create({
    //   name,
    //   url: sendData.Location,
    // });
    // return this.attachmentRepo.save(attachment);
  }

  private async _uploadAwsFile(
    file: Express.Multer.File,
    user: User,
  ): Promise<any> {
    const mediaPath = await this.configService.get('MEDIA_PATH');
    file.path = `${mediaPath}/${file.originalname}`;
    const oldFile = file.path;
    const newFile = `${uuid()}`;
    //get the extension of a file
    const get_extension = this._getFileExtension(file.path);
    if (
      get_extension == '.mp4' ||
      get_extension == '.mov' ||
      get_extension == '.wmv' ||
      get_extension == '.avi' ||
      get_extension == '.f4v' ||
      get_extension == '.webm'
    ) {
      // transcode video
      await fs.rename(oldFile, newFile);
      const transcodeVideo = await this._transcodeVideo(newFile, user);
      const media = await this.mediaRepo.findOneBy({ pid: transcodeVideo.pid });
      const output = `${mediaPath}/${media.outputVideo}`;
      const transcodeFile = await fs.readFile(output);
      try {
        const bucket = this.configService.get('AWS_BACKET_NAME');
        const region = this.configService.get('AWS_BACKET_REGION');
        const accessKeyId = this.configService.get('AWS_ACCESS_KEY');
        const secretAccessKey = this.configService.get('AWS_SECRET_KEY');
        const awsFile: PutObjectCommandInput = {
          Body: transcodeFile,
          Bucket: bucket,
          Key: `${uuid()}-${media.outputVideo}`,
          ContentType: file.mimetype,
          ACL: 'public-read',
        };

        const s3 = new S3({
          region: region,
          credentials: {
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
          },
        });
        console.log('');
        const command = new AbortMultipartUploadCommand({
          Key: secretAccessKey,
          Bucket: bucket,
          UploadId: uuid,
        });
        return s3.send(command);
      } catch (e) {
        throw new ConflictException(
          new AppError(ERR_UPLOAD_FAILED, 'Cannot save file to s3'),
        );
      }
    } else {
      {
        throw new ConflictException(
          new AppError('THIS_TYPE_OF_FILE_IS_NOT_A_VIDEO_TYPE'),
        );
      }
    }
  }

  private async _transcodeVideo(
    inputVideoPath: string,
    user: User,
  ): Promise<ChildProcess> {
    const created_by = user.id;
    const outputVideo = `${uuid()}-output.mp4`;
    const transcodeCommand = `ffmpeg -i ${inputVideoPath} -vcodec h264 -acodec aac -strict -2 ${outputVideo}`;
    const transferCommand = `mv ${outputVideo} /Users/jed/Downloads`;

    const transCode = await new Promise(
      async (resolve, reject): Promise<ChildProcess> => {
        return exec(transcodeCommand, (error, stdout, stderr) => {
          if (error) {
            reject(error);
          } else {
            console.log(stderr);
            resolve(stdout);
          }
        });
        // Move the transCoded video to the new directory
      },
    ).then(async (value) => exec(transferCommand));
    const pid = transCode.pid;
    const media = this.mediaRepo.create({
      outputVideo,
      created_by,
      pid,
    });
    await this.mediaRepo.save(media);
    return transCode;
  }

  private _getFileExtension(filePath: string): string {
    return path.extname(filePath);
  }

  async upload(file, uploadAttachmentDto: UploadAttachmentDto, user: User) {
    try {
      const bucket = this.configService.get('AWS_BACKET_NAME');
      const region = this.configService.get('AWS_BACKET_REGION');
      const accessKeyId = this.configService.get('AWS_ACCESS_KEY');
      const secretAccessKey = this.configService.get('AWS_SECRET_KEY');
      const awsFile: PutObjectCommandInput = {
        Body: file.buffer,
        Bucket: bucket,
        Key: `${uuid()}-${file.originalname}`,
        ContentType: file.mimetype,
        ACL: 'public-read',
      };

      const s3 = new S3({
        region: region,
        credentials: {
          accessKeyId: accessKeyId,
          secretAccessKey: secretAccessKey,
        },
      });
      const command = new AbortMultipartUploadCommand({
        Key: secretAccessKey,
        Bucket: bucket,
        UploadId: uuid,
      });
      const sendData = await s3.send(command);
      // save attachment after upload
      const { name } = uploadAttachmentDto;
      const attachment = this.attachmentRepo.create({
        name,
        url: sendData.$metadata.cfId,
      });
      return this.attachmentRepo.save(attachment);
    } catch (e) {
      throw new ConflictException(
        new AppError(ERR_UPLOAD_FAILED, 'Cannot save file to s3'),
      );
    }
  }

  async uploadFromFile(file, user: User) {
    const mysql = require('mysql2');
    const xlsx = require('xlsx');
    const mediaPath = await this.configService.get('MEDIA_PATH');
    file.path = `${mediaPath}/${file.originalname}`;
    const oldFile = file.path;
    const newFile = `${mediaPath}/${file.originalname.split(' ').join('')}`;
    await fs.rename(oldFile, newFile);
    // Connect to the database
    const connection = mysql.createConnection({
      host: 'localhost',
      port: 8889,
      user: 'root',
      password: 'root',
      database: 'event_app',
    });
    // Read the .xlsx file
    const workbook = readFile(newFile);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);
    // Iterate through the data and insert it into the database
    for (const row of data) {
      connection.query('INSERT INTO browser SET ?', row, (error, results) => {
        // this.browserRepo.save(row);
        if (error) return this.browserRepo.save(row);
      });
    }

    // Close the connection
    connection.end();
  }

  async fetch() {
    const requestOption = {
      method: 'GET',
      headers: {
        content_type: 'application/json',
      },
    };
    fetch(
      'https://uventlyapp.s3.amazonaws.com/34596358-28a0-4473-86dd-b301eb346168-test2.json',
      requestOption,
    )
      .then((response) => response.json())
      .then((data) => {
        // console.log(json4.trigger);
        for (const json of data) {
          const newUser = new Json();
          newUser.trigger = json.trigger.url;
          newUser.ActionType = json.action.type;
          newUser.ActionSelector = json.action.selector;
          this.jsonRepo.save(newUser);
        }
      })
      .catch((error) => {
        console.log(error);
        throw new HttpException(error, error.code);
      });
  }

  remove(id: number) {
    return `This action removes a #${id} attachment`;
  }
}
