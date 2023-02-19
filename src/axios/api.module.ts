import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { ApiController } from './api.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../event/entities/event.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Event])], // imported axios/HttpModule
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
