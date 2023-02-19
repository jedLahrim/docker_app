import { Module } from '@nestjs/common';
import { FirebaseController } from './firebase.controller';
import { FirebaseService } from './firebase.service';
import { FirebaseDynamicLinksService } from './firebase-dynamic-links.service';

@Module({
  controllers: [FirebaseController],
  providers: [FirebaseService, FirebaseDynamicLinksService],
})
export class FirebaseModule {}
