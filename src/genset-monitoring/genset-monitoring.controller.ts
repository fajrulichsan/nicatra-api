import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GensetMonitoringService } from './genset-monitoring.service';
import { CreateGensetMonitoringDto } from './dto/create-genset-monitoring.dto';
import { UpdateGensetMonitoringDto } from './dto/update-genset-monitoring.dto';

@Controller('genset-monitoring')
export class GensetMonitoringController {
  constructor(private readonly service: GensetMonitoringService) {}

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
  async findAll() {
    const result = await this.service.findAll();
    return {
      message: 'Genset monitoring records fetched successfully',
      acknowledged: true, 
      data: result,
    };
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGensetMonitoringDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
