import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { GensetMonitoringService } from './genset-monitoring.service';
import { CreateGensetMonitoringDto } from './dto/create-genset-monitoring.dto';
import { AlertGensetStatusDto } from './dto/alert-genset.dto';

@Controller('genset-monitoring')
export class GensetMonitoringController {
  constructor(private readonly service: GensetMonitoringService) {}

  @Post('alert-status')
  async alertGensetStatus(
    @Body() dto: AlertGensetStatusDto
  ): Promise<{ message: string }> {
    await this.service.alertGensetStatus(
      dto.gensetId,
      dto.voltage,
      dto.current,
      dto.power
    );
    return { message: 'Notifikasi dan email berhasil dikirim ke semua admin.' };
  }


  @Post()
  async create(@Body() dto: CreateGensetMonitoringDto) {

    const result = await this.service.create(dto);
    return {
      message: 'Genset monitoring record created successfully',
      acknowledged: true,  // Menambahkan acknowledged
      data: result,
    };
  }


  @Get()
  async findAll(
    @Query('stationCode') stationCode?: string,
  ) {
    const result = await this.service.findAll(stationCode);
    return {
      message: 'Genset monitoring records fetched successfully',
      acknowledged: true,
      data: result,
    };
  }

 
}
