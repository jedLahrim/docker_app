import {
  ConflictException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { AppError } from '../commons/errors/app-error';
import {
  EMAIL_OR_PASSWORD_IS_INCORRECT,
  ERR_EMAIL_ALREADY_EXIST,
  ERR_EMAIL_NOT_FOUND,
  ERR_EXPIRED_CODE,
  ERR_NOT_FOUND_USER,
  ERR_SEND_MAIL,
  ERR_USER_NOT_ACTIVATED,
} from '../commons/errors/errors-codes';
import { MailerService } from '@nestjs-modules/mailer';
import { MyCode } from '../code/code.entity';
import { Constant } from '../commons/constant';
import { LoginUserDto } from './dto/login-user.dto';
import { ResetUserDto } from './dto/reset-user-password.dto';
import { ChangeUserDto } from './dto/change-user-password.dto';
import { ConfigService } from '@nestjs/config';
import {
  ACCESS_TOKEN_EXPIRED_IN,
  REFRESH_TOKEN_EXPIRED_IN,
} from '../shared/constants';
import { jwtStrategy } from './strategy/jwt.strategy';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(MyCode)
    private myCodeRepo: Repository<MyCode>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @Inject(forwardRef(() => JwtService))
    private jwtService: JwtService,
    private jwtStrategy: jwtStrategy,
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { email, fullName, password } = createUserDto;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = this.userRepo.create({
      email,
      fullName: fullName,
      password: hashedPassword,
    });

    try {
      const newUser = await this.userRepo.save(user);

      await this.sendMail(user.email, newUser);
      // return newUser;
    } catch (error) {
      if (error.code == 'ER_DUP_ENTRY') {
        throw new ConflictException(new AppError(ERR_EMAIL_ALREADY_EXIST));
      } else {
        throw new InternalServerErrorException('402');
      }
    }
  }

  async sendMail(email: string, user: User): Promise<any> {
    try {
      user = await this.userRepo.findOne({ where: { email } });

      const from = this.configService.get('SENDER_MAIL');
      const code = await this.generateCode(user);

      await this.mailerService.sendMail({
        to: user.email,
        from: from,
        subject: `Hi ${user.fullName} this is your activation code ${code.code}`,
        text:
          `Hello ${user.fullName} from eventApp ` +
          `this is your activation code ${code.code}`,
        //html: `Click <a href="${url}">here</a> to activate your account !`,
      });
    } catch (e) {
      throw new NotFoundException(
        new AppError(ERR_SEND_MAIL, 'email not found'),
      );
    }
  }

  async sendResetMail(user: User, email: string | any) {
    user = await this.userRepo.findOne({ where: { email } });

    if (user == null) {
      throw new ConflictException(
        new AppError(ERR_EMAIL_NOT_FOUND, 'email not found'),
      );
    } else {
      const code = await this.generateResetCode(user);
      console.log(code.code);
      await this.mailerService.sendMail({
        to: user.email,
        from: this.configService.get('SENDER_MAIL'),
        subject: `Hi ${user.fullName} this is your activation code ${code.code}`,
        text:
          `Hello ${user.fullName} from eventApp ` +
          `this is your activation code ${code.code}`,
        //html: `Click <a href="${url}">here</a> to activate your account !`,
      });
    }
  }

  async activate(code: any): Promise<User> {
    // EXPIRE_AT 20:15:20
    // new Date() 20:15:10
    const now = new Date();
    const found = await this.myCodeRepo.findOne({ where: { code: code } });
    if (!found) {
      throw new ConflictException('code is incorrect');
    }
    const user = await this.getUserById(found.userId);
    if (user.code.length > 2) {
      throw new InternalServerErrorException(
        new AppError(`ERR`, 'account already activated'),
      );
    }
    if (found.expireAt < now) {
      throw new HttpException(
        new AppError(
          ERR_EXPIRED_CODE,
          'this code is expired try to send it again',
        ),
        HttpStatus.NOT_FOUND,
      );
    } else {
      user.activated = true;
      await this.userRepo.save(user);
      return this.getUserWithTokens(user);
    }
  }

  async reset(resetUserDto: ResetUserDto) {
    const { newPassword, code } = resetUserDto;
    try {
      const now = new Date();
      // let fx = '';

      const found = await this.myCodeRepo.findOne({ where: { code: code } });
      const user = await this.getUserById(found.userId);
      if (found.expireAt < new Date()) {
        //
        await this.myCodeRepo.delete({ id: found.id });
        return new AppError(
          ERR_EXPIRED_CODE,
          'this code is expired try to send it again',
        );
      } else {
        if (found.code == code) {
          const salt = await bcrypt.genSalt(5);
          const hashedPassword = await bcrypt.hash(newPassword, salt);

          // user = await this.userRepo.create({ reset_password: hashedPassword });
          // const result = await this.authService.updateData(user.id, {
          //   new_password,
          // });
          //
          user.password = hashedPassword;
          const newUser = await this.userRepo.save(user);
          return this.getUserWithTokens(newUser);

          // return hashedPassword;
        }
      }
    } catch (error) {
      if (error.code == undefined) {
        throw new ConflictException(
          new AppError('INCORRECT_CODE', 'code is incorrect'),
        );
      }
    }
  }

  async changePassword(user: User, changeUserDto: ChangeUserDto) {
    const { oldPassword, newPassword } = changeUserDto;
    if (user && (await bcrypt.compare(oldPassword, user.password))) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      user.password = hashedPassword;
      const newUser = await this.userRepo.save(user);
      return this.getUserWithTokens(newUser);
      // return hashedPassword;
    } else {
      throw new NotFoundException(
        new AppError('OLD_NOT_FOUND_PASSWORD', 'old password not found'),
      );
    }
  }

  //Login
  async login(loginUserDto: LoginUserDto): Promise<any> {
    const { email, password } = loginUserDto;
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new InternalServerErrorException(new AppError(ERR_NOT_FOUND_USER));
    } else {
      if (user.activated === false) {
        throw new ConflictException(new AppError(ERR_USER_NOT_ACTIVATED));
      } else {
        if (user && (await bcrypt.compare(password, user.password))) {
          const payload = { email };
          const access = this.generateToken(payload, ACCESS_TOKEN_EXPIRED_IN);
          const access_expire_at = new Date(
            new Date().getTime() + ACCESS_TOKEN_EXPIRED_IN,
          );
          const refresh = this.generateToken(payload, REFRESH_TOKEN_EXPIRED_IN);
          const refresh_expire_at = new Date(
            new Date().getTime() + REFRESH_TOKEN_EXPIRED_IN,
          );
          user.access = access;
          user.access_expire_at = access_expire_at;
          user.refresh = refresh;
          user.refresh_expire_at = refresh_expire_at;
          return user;
        } else {
          throw new UnauthorizedException(
            new AppError(EMAIL_OR_PASSWORD_IS_INCORRECT),
          );
        }
      }
    }
  }

  async getUserWithTokens(user: User) {
    try {
      const payload1 = { user: user.email };
      const accessExpireIn = 864000000;
      const accessToken = this.generateToken(payload1, accessExpireIn);
      const access_expire_at = new Date(new Date().getTime() + accessExpireIn);

      const refreshExpireIn = 172800000;
      const refresh = this.generateToken(payload1, refreshExpireIn);
      const refresh_expire_at = new Date(new Date().getTime() + accessExpireIn);

      user.access = accessToken;
      user.access_expire_at = access_expire_at;
      user.refresh = refresh;
      user.refresh_expire_at = refresh_expire_at;
      return user;
    } catch (e) {
      throw new NotFoundException(
        new AppError('USER_NOT_FOUND', 'user not found'),
      );
    }
  }

  async getUserById(id: string): Promise<User> {
    const found = await this.userRepo.findOne({ where: { id } });
    if (!found) {
      throw new NotFoundException(
        new AppError('ID_NOT_FOUND', `user with id '${id}' not found`),
      );
    }
    return found;
  }

  async generateCode(user: User) {
    const code = Constant.randomCodeString(6);
    const expireAt = new Date(new Date().getTime() + 200000);
    const thisCode = this.myCodeRepo.create({
      code: code,
      expireAt: expireAt,
      user: user,
    });
    return this.myCodeRepo.save(thisCode);
  }

  async generateResetCode(user: User) {
    const code = Constant.ResetCodeString(6);
    const expireAt = new Date(new Date().getTime() + 200000);
    const thisCode = this.myCodeRepo.create({
      code: code,
      expireAt: expireAt,
      user: user,
    });
    return this.myCodeRepo.save(thisCode);
  }

  private generateToken(payload: any, expiresIn: number): string {
    return this.jwtService.sign(payload, {
      expiresIn: expiresIn,
      secret: 'jedJlxSecret2023',
    });
  }

  async saveUser(user: User): Promise<User> {
    return await this.userRepo.save(user);
  }

  async update(
    id: string,
    full_name: string,
    profile_picture: any,
  ): Promise<User> {
    const pathMedia = this.configService.get('MEDIA_PATH');
    const path = `${pathMedia}${profile_picture.originalname}`;
    const result = await this.getUserById(id);
    result.fullName = full_name;
    result.profilePicture = path;
    const newUser = await this.userRepo.save(result);
    return this.getUserWithTokens(newUser);
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async getUserByToken(token: string): Promise<User> {
    const result = this.jwtService.verify(token, {
      secret: Constant.JWTSecret,
    });

    if (result.email) {
      return this.userRepo.findOne({ where: { email: result.email } });
    } else {
      throw new NotFoundException(
        new AppError(ERR_NOT_FOUND_USER, 'user not exist'),
      );
    }
  }

  async refreshToken(refresh: string): Promise<User> {
    try {
      // Check if refresh is valid
      const r = this.jwtService.verify(refresh, { secret: Constant.JWTSecret });

      // GET USER
      const user = await this.getUserByToken(refresh);

      return this.getUserWithTokens(user);
    } catch (e) {
      throw new NotFoundException(
        new AppError(ERR_NOT_FOUND_USER, 'user not exist'),
      );
    }

    /*if (!user) {
          throw new NotFoundException(`user with ID "${id}" not found`);
        } else {
          user.id = id;
          await this.userRepo.save(user);
          const { email } = createUserDto;
          
          user = await this.userRepo.findOne({ where: { id } });
          const payload = { email };
          const refresh_tok: jwtPayload & any = this.jwtService.sign(payload, {
            expiresIn: 864000,
            secret: 'jedJlxSecret2023',
          });
          
          const access: any = await this.tokenService.accessTokens(id, user);
          const decode3 = this.jwtService.verify(refresh_tok, {
            secret: 'jedJlxSecret2023',
          });
          // 
          // 
          return {
            user,
            access_token: access,
            access_expiry_at: followingDay,
            refresh_token: refresh_tok,
            refresh_expiry_at: followingDay2,
          };
      }*/
  }
}
