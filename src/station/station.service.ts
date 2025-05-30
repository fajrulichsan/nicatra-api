import { HttpException, HttpStatus, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Station } from './entities/station.entity';  
import { InjectRepository } from '@nestjs/typeorm';
import { console } from 'inspector';

@Injectable()
export class StationService {
  private readonly logger = new Logger(StationService.name);

  constructor(
    @InjectRepository(Station)
    private readonly stationRepo: Repository<Station>,
  ) {}

  async getAllActiveStations(): Promise<Station[]> {
    try {
      const result =  await this.stationRepo.find(
        {
          where: { statusData: true },
        },
      );
      return result;
    } catch (error) {
      this.logger.error('Failed to fetch active stations', error.stack);
      throw new HttpException('Failed to fetch active stations', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
