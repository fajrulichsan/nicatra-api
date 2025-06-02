import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { EmailService } from 'src/common/email/email.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { User } from 'src/user/entities/user.entity';
import { Station } from 'src/station/entities/station.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User, Station]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, EmailService],
})
export class NotificationModule {}
