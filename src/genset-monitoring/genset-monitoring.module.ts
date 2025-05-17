import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GensetMonitoring } from './entities/genset-monitoring.entity';
import { GensetMonitoringService } from './genset-monitoring.service';
import { GensetMonitoringController } from './genset-monitoring.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GensetMonitoring])],
  controllers: [GensetMonitoringController],
  providers: [GensetMonitoringService],
})
export class GensetMonitoringModule {}
