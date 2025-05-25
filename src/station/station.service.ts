import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Station } from './entities/station.entity';  
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class StationService {
  constructor(
    @InjectRepository(Station)
    private readonly stationRepo: Repository<Station>,
  ) {}

  async getAllActiveStations(): Promise<Station[]> {
    return this.stationRepo.find({
      where: { statusData: true },
      order: { name: 'ASC' }, // opsional, urut berdasarkan nama
    });
  }
}
