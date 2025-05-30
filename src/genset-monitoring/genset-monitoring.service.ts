import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { GensetMonitoring } from './entities/genset-monitoring.entity';
import { CreateGensetMonitoringDto } from './dto/create-genset-monitoring.dto';
import { UpdateGensetMonitoringDto } from './dto/update-genset-monitoring.dto';

@Injectable()
export class GensetMonitoringService {
  private readonly logger = new Logger(GensetMonitoringService.name);

  constructor(
    @InjectRepository(GensetMonitoring)
    private readonly gensetRepo: Repository<GensetMonitoring>,
  ) {}

  // Create method
  async create(dto: CreateGensetMonitoringDto) {
    this.logger.log('Creating new genset monitoring record :', dto);

    const data = this.gensetRepo.create(dto);
    const savedData = await this.gensetRepo.save(data);

    this.logger.log('Genset monitoring record created successfully:');
    return savedData;
  }

  async findAll() {
    this.logger.log('Fetching all genset monitoring records where statusData is true and within the last 24 hours');

    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24); // Mengurangi 24 jam dari waktu sekarang
    
    const records = await this.gensetRepo.find({
      where: {
        statusData: true,
        createdAt: MoreThan(twentyFourHoursAgo),
      },
      order: {
        createdAt: 'DESC', 
      },
    });
  
    this.logger.log('Genset monitoring records fetched');
    return records;
  }
  

  async findOne(id: number) {
    this.logger.log(`Fetching genset monitoring record with ID: ${id}`);
    const record = await this.gensetRepo.findOneBy({ id });
    this.logger.log(`Genset monitoring record with ID ${id} fetched:`);
    return record;
  }

  // Update record
  async update(id: number, dto: UpdateGensetMonitoringDto) {
    this.logger.log(`Updating genset monitoring record with ID: ${id}`);

    await this.gensetRepo.update(id, dto);
    this.logger.log(`Genset monitoring record with ID: ${id} updated`);

    return this.findOne(id); 
  }

  // Delete record
  async remove(id: number) {
    this.logger.log(`Deleting genset monitoring record with ID: ${id}`);

    await this.gensetRepo.delete(id);
    this.logger.log(`Genset monitoring record with ID: ${id} deleted`);

    return { deleted: true };
  }
}
