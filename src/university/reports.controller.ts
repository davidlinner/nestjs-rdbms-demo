import { Controller, DefaultValuePipe, Get, ParseFloatPipe, ParseIntPipe, Query } from '@nestjs/common';
import { ReportsService } from './reports.service.js';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('courses')
  courses(
    @Query('maxAvg', new DefaultValuePipe(2.0), ParseFloatPipe) maxAvg: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.reports.coursesWithGoodAverage(maxAvg, limit, offset);
  }
}
