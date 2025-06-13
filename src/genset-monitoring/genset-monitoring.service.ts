import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GensetMonitoring } from './entities/genset-monitoring.entity';
import { CreateGensetMonitoringDto } from './dto/create-genset-monitoring.dto';
import { User } from 'src/user/entities/user.entity';
import { NotificationService } from 'src/notification/notification.service';
import { EmailService } from 'src/common/email/email.service';
import { Station } from 'src/station/entities/station.entity';
import { IssueService } from 'src/issue/issue.service';
import { Issue } from 'src/issue/entities/issue.entity';
import { log } from 'console';

@Injectable()
export class GensetMonitoringService {
  private readonly logger = new Logger(GensetMonitoringService.name);

  constructor(
    @InjectRepository(GensetMonitoring)
    private readonly gensetRepo: Repository<GensetMonitoring>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Station)
    private readonly stasiunRepo: Repository<Station>,
    @InjectRepository(Issue)
    private readonly issueRepo: Repository<Issue>,
    private readonly notificationService : NotificationService,
    private readonly emailService : EmailService,
    private readonly issueService: IssueService
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
    voltage: number,
    current: number,
    power: number
  ): Promise<void> {
    const [adminUsers, station, shouldAlert] = await Promise.all([
      this.userRepo.find({
        where: {
          statusData: true,
          isVerified: true,
        },
      }),
      this.stasiunRepo.findOne({ where: { code: gensetId } }),
      this.hasUnresolvedIssueOverOneHour(gensetId),
    ]);
  
    if (!shouldAlert || !station) {
      throw new HttpException('No unresolved issues or station not found', 404);
    }
  
    const subject = `Status Terbaru Pada Stasiun ${station.name}`;
    const bodyText = `Status terkini genset di stasiun ${station.name}:\nVoltage: ${voltage} V, Current: ${current} A, Power: ${power} W`;
  
    await Promise.all(
      adminUsers.map(async (user) => {
        await this.emailService.sendGensetStatus(
          gensetId,
          station.name,
          voltage,
          current,
          power,
          user.email
        );
  
        await this.notificationService.createNotification(subject, bodyText, user.id);
      })
    );
  
    await this.issueService.create(gensetId, true);
  
    this.logger.log(`Notifikasi, email, dan issue berhasil dibuat untuk stasiun ${station.name}.`);
  }
  


  async hasUnresolvedIssueOverOneHour(stationCode: string): Promise<boolean> {
    const openIssue = await this.issueRepo.findOne({
      where: {
        stationCode,
        status: true, 
      },
      order: { createdAt: 'DESC' },
    });
  
    
    if (!openIssue) return false;
  
    const now = new Date();
    const createdAt = new Date(openIssue.createdAt);
    const oneHourInMs = 60 * 60 * 1000;
  
    return now.getTime() - createdAt.getTime() > oneHourInMs;
  }
  

}
