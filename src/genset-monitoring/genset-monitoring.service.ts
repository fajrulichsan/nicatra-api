import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    this.logger.log('Creating new genset monitoring record');

    const data = this.gensetRepo.create(dto);
    const savedData = await this.gensetRepo.save(data);

    this.logger.log('Genset monitoring record created successfully:');
    return savedData;
  }

  // Find all records
  async findAll() {
    this.logger.log('Fetching all genset monitoring records where statusData is true');
    
    // Menggunakan parameter where untuk memfilter statusData true
    const records = await this.gensetRepo.find({
      where: { statusData: true }, // hanya ambil yang statusData true
    });
  
    this.logger.log('Genset monitoring records fetched ');
    return records;
  }
  

  // Find one record by ID
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

    return this.findOne(id); // Mengembalikan data yang sudah diupdate
  }

  // Delete record
  async remove(id: number) {
    this.logger.log(`Deleting genset monitoring record with ID: ${id}`);

    await this.gensetRepo.delete(id);
    this.logger.log(`Genset monitoring record with ID: ${id} deleted`);

    return { deleted: true };
  }
}
