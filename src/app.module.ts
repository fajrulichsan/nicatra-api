import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GensetMonitoringModule } from './genset-monitoring/genset-monitoring.module';

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
  GensetMonitoringModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
