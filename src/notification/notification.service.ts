import { Injectable, Logger } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { EmailService } from 'src/common/email/email.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);  // Logger instance untuk class ini

  constructor(
    private readonly emailService: EmailService,
  ) {}

  create(createNotificationDto: CreateNotificationDto) {
    this.logger.log('Creating a new notification...');
    return 'This action adds a new notification';
  }

  findAll() {
    this.logger.log('Fetching all notifications...');
    return `This action returns all notification`;
  }

  findOne(id: number) {
    this.logger.log(`Fetching notification with ID: #${id}`);
    return `This action returns a #${id} notification`;
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    this.logger.log(`Updating notification with ID: #${id}`);
    return `This action updates a #${id} notification`;
  }

  remove(id: number) {
    this.logger.log(`Removing notification with ID: #${id}`);
    return `This action removes a #${id} notification`;
  }

  public async sendGensetStatusEmail(gensetId: string, station : string, voltage: number, current: number, power: number, recipientEmail: string): Promise<void> {
    this.logger.log(`Sending genset status email for Genset ID: ${gensetId} to ${recipientEmail}`);
    
    try {
      await this.emailService.sendGensetStatus(gensetId, station, voltage, current, power, recipientEmail);  // Memanggil fungsi sendGensetStatus dari EmailService
      this.logger.log(`Email sent successfully to ${recipientEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send genset status email to ${recipientEmail}: ${error.message}`, error.stack);
      throw new Error(`Failed to send genset status email: ${error.message}`);
    }
  }
}
