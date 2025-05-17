import { PartialType } from '@nestjs/mapped-types';
import { CreateGensetMonitoringDto } from './create-genset-monitoring.dto';

export class UpdateGensetMonitoringDto extends PartialType(CreateGensetMonitoringDto) {}
