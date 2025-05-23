import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @Get()
  findAll() {
    return this.notificationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationService.update(+id, updateNotificationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationService.remove(+id);
  }

  @Post('send-genset-status')
  async sendGensetStatusEmail(@Body() body: { gensetId: string; station: string; voltage: number; current: number; power: number; recipientEmail: string }) {
    const { gensetId, voltage, current, power, station, recipientEmail } = body;
    await this.notificationService.sendGensetStatusEmail(gensetId, station, voltage, current, power, recipientEmail);
    return { 
      message: 'Email sent successfully to :' + recipientEmail 
    };
  }
}
