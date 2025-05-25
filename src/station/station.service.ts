import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Station } from './entities/station.entity';  
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class StationService {
  private readonly logger = new Logger(StationService.name);

  constructor(
    @InjectRepository(Station)
    private readonly stationRepo: Repository<Station>,
  ) {}

  async getAllActiveStations(): Promise<Station[]> {
    try {
      return await this.stationRepo.find({
        where: { statusData: true },
        order: { name: 'ASC' },
      });
    } catch (error) {
      this.logger.error('Failed to fetch active stations', error.stack);
      throw new InternalServerErrorException('Failed to fetch active stations');
    }
  }
}
