import { CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { UserModule } from './auth/user.module';
@Module({
  imports: [
    // .env File Or Dashboard
    ConfigModule.forRoot({
      ignoreEnvFile: false,
      cache: true,
      envFilePath: '.env',
      isGlobal: true,
    }),
    CacheModule.register({ isGlobal: true, ttl: 50000 }),
    ScheduleModule.forRoot(),
    // TwilioModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (cfg: ConfigService) => ({
    //     accountSid: cfg.get(TWILIO_ACCOUNT_SID),
    //     authToken: cfg.get(TWILIO_AUTH_TOKEN),
    //   }),
    //   inject: [ConfigService],
    // }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        //process.env what you have in CMD
        const isProd =
          process.env.STAGE == 'prod' || process.env.STAGE == 'dev';
        // mysql://<username>:<password>@<host>:<port>/<db_name>
        return {
          type: 'mysql',
          host: isProd
            ? configService.get('DB_HOST')
            : 'eventapp-database.ccuvdqrdczzr.us-west-2.rds.amazonaws.com',
          port: isProd ? configService.get('DB_PORT') : 3306,
          // ssl: process.env.STAGE == 'prod',
          /*extra: {
              ssl: process.env.STAGE == 'prod' ? {rejectUnauthorized: false} : null,
          },*/
          username: isProd ? configService.get('DB_USERNAME') : 'admin',
          password: isProd ? configService.get('DB_PASSWORD') : 'jolix1235',
          database: isProd ? configService.get('DB') : 'event_app',

          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    //
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
//
