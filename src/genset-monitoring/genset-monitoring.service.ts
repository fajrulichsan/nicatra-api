import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { GensetMonitoring } from './entities/genset-monitoring.entity';
import { CreateGensetMonitoringDto } from './dto/create-genset-monitoring.dto';
import { User } from 'src/user/entities/user.entity';
import { NotificationService } from 'src/notification/notification.service';
import { EmailService } from 'src/common/email/email.service';
import { Station } from 'src/station/entities/station.entity';

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
    const data = this.gensetRepo.create(dto);
    const savedData = await this.gensetRepo.save(data);

    this.logger.log('Genset monitoring record created successfully:');
    return savedData;
  }

  async findAll(stationCode?: string) {
    this.logger.log('Fetching genset monitoring with station info');

    this.logger.log('stationCode:', stationCode);
  
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
  
    const query = this.gensetRepo
      .createQueryBuilder('gm')
      .leftJoinAndMapOne(
        'gm.station',
        Station,
        'station',
        'gm.gensetId = station.code'
      )
      .where('gm.statusData = :status', { status: true })
      .andWhere('gm.createdAt >= :date', { date: twentyFourHoursAgo });
  
    if (stationCode) {
      query.andWhere('gm.gensetId = :stationCode', { stationCode });
    }
  
    const records = await query
      .orderBy('gm.createdAt', 'DESC')
      .getMany();
  
    this.logger.log('Genset monitoring records with station fetched');
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
