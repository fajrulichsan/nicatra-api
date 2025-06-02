import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { GensetMonitoring } from './entities/genset-monitoring.entity';
import { CreateGensetMonitoringDto } from './dto/create-genset-monitoring.dto';
import { User } from 'src/user/entities/user.entity';
import { NotificationService } from 'src/notification/notification.service';
import { EmailService } from 'src/common/email/email.service';

@Injectable()
export class GensetMonitoringService {
  private readonly logger = new Logger(GensetMonitoringService.name);

  constructor(
    @InjectRepository(GensetMonitoring)
    private readonly gensetRepo: Repository<GensetMonitoring>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notificationService : NotificationService,
    private readonly emailService : EmailService
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
  
  async alertGensetStatus(
    gensetId: string,
    station: string,
    voltage: number,
    current: number,
    power: number
  ): Promise<void> {
    const adminUsers = await this.userRepo.find({
      where: {
        statusData: true,
        isVerified: true,
      },
    });
  
    const subject = `Status Terbaru Genset ${gensetId}`;
    const bodyText = `Status terkini genset di stasiun ${station}:\nVoltage: ${voltage} V, Current: ${current} A, Power: ${power} W`;
  

    this.logger.log(adminUsers)
    
    for (const user of adminUsers) {
      // Kirim email HTML
      await this.emailService.sendGensetStatus(
        gensetId,
        station,
        voltage,
        current,
        power,
        user.email
      );
  
      // Buat notifikasi di sistem
      await this.notificationService.createNotification(
        subject,
        bodyText,
        user.id
      );
    }
  }
  
  
}
