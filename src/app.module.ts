import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GensetMonitoringModule } from './genset-monitoring/genset-monitoring.module';
import { UserModule } from './user/user.module';
import { NotificationModule } from './notification/notification.module';
import { StationModule } from './station/station.module';
import { IssueModule } from './issue/issue.module';

@Module({
  imports: [ 
    TypeOrmModule.forRoot({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
      // username: 'root',
      // password: 'root',
    username: 'nicatra',
    password: 'Isan02082000!',
    database: 'nicatra',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: true,
  }),
  GensetMonitoringModule,
  UserModule,
  NotificationModule, 
  StationModule, IssueModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
