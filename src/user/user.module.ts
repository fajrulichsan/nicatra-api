import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { EmailService } from 'src/common/email/email.service';
import { NotificationService } from 'src/notification/notification.service';
import { Notification } from 'src/notification/entities/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Notification]),
    JwtModule.register({
      secret: 'jwt_secret_key', 
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [UserService, EmailService, NotificationService],
  controllers: [UserController],
})
export class UserModule {}
