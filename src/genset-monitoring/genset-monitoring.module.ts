import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GensetMonitoring } from './entities/genset-monitoring.entity';
import { GensetMonitoringService } from './genset-monitoring.service';
import { GensetMonitoringController } from './genset-monitoring.controller';
import { NotificationService } from 'src/notification/notification.service';
import { EmailService } from 'src/common/email/email.service';
import { User } from 'src/user/entities/user.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import { Station } from 'src/station/entities/station.entity';
import { BullModule } from '@nestjs/bull';
import { IssueService } from 'src/issue/issue.service';
import { Issue } from 'src/issue/entities/issue.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GensetMonitoring, User, Notification, Station, Issue])],
  controllers: [GensetMonitoringController],
  providers: [GensetMonitoringService, NotificationService, EmailService, IssueService],
})
export class GensetMonitoringModule {}
