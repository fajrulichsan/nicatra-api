import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Station } from 'src/station/entities/station.entity';

export class NotificationService {

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Station)
    private readonly stationRepo: Repository<Station>
    
  ) {}

  async getNotificationsByRecipient(recipientId: number): Promise<any> {
    const notifications = await this.notificationRepo.find({
      where: { recipientId, statusData: true },
      order: { createdAt: 'DESC' }
    });
  
    const now = new Date();
  
    function timeAgo(date: Date): string {
      const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
      if (seconds < 60) return `${seconds} seconds ago`;
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes} minutes ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} hours ago`;
      const days = Math.floor(hours / 24);
      if (days < 30) return `${days} days ago`;
      const months = Math.floor(days / 30);
      if (months < 12) return `${months} months ago`;
      const years = Math.floor(months / 12);
      return `${years} years ago`;
    }
  
    return notifications.map(notif => ({
      id: notif.id,
      title: notif.title,
      description: notif.body,
      time: timeAgo(notif.createdAt),
      read: notif.isRead,
    }));
  }

  async markAsRead(notificationId: number): Promise<Notification | null> {
    const notif = await this.notificationRepo.findOneBy({ id: notificationId });
    if (!notif) return null;

    notif.isRead = true;
    notif.updatedAt = new Date();
    return this.notificationRepo.save(notif);
  }

  async createNotification(
    title: string,
    body: string,
    recipientId: number,
  ): Promise<Notification> {
    const notif = this.notificationRepo.create({
      title,
      body,
      recipientId,
    });
    return this.notificationRepo.save(notif);
  }  

  async dataSummary(): Promise<any> {
    const totalUsers = await this.userRepo.count({
      where: { isVerified:true, statusData: true, isAdmin: false },
    });
  
    const totalUserRequestApprove = await this.userRepo.count({
      where: { isVerified: false, statusData: true },
    });
  
    const totalStations = await this.stationRepo.count({
      where: { statusData: true },
    });
  
    return {
      totalUsers,
      totalUserRequestApprove,
      totalStations,
    };
  }
  
}
