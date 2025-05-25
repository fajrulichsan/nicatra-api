import {
  Controller,
  Get,
  Patch,
  Param,
  HttpStatus,
} from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get(':recipientId')
  async getNotificationsByRecipient(@Param('recipientId') recipientId: number) {
    const notifications = await this.notificationService.getNotificationsByRecipient(recipientId);
    return {
      acknowledge: true,
      message: 'Notifications retrieved successfully',
      data: notifications,
      statusCode: HttpStatus.OK,
    };
  }

  @Patch('read/:id')
  async markAsRead(@Param('id') id: number) {
    const updatedNotification = await this.notificationService.markAsRead(id);

    return {
      acknowledge: true,
      message: 'Notification marked as read',
      data: updatedNotification,
      statusCode: HttpStatus.OK,
    };
  }

  @Get('summary/data')
  async dataSummary() {
    const summary = await this.notificationService.dataSummary();
    return {
      acknowledge: true,
      message: 'Summary data retrieved successfully',
      data: summary,
      statusCode: HttpStatus.OK,
    };
  }
}
