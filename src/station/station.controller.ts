import { Controller, Get, HttpStatus } from '@nestjs/common';
import { StationService } from './station.service';

@Controller('stations')
export class StationController {
  constructor(private readonly stationService: StationService) {}

  @Get()
  async getAllStations() {
    const stations = await this.stationService.getAllActiveStations();
    return {
      acknowledge: true,
      message: 'Stations retrieved successfully',
      data: stations,
      statusCode: HttpStatus.OK,
    };
  }
}
