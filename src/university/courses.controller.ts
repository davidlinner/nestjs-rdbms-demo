import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { CoursesService } from './courses.service.js';

@Controller('courses')
export class CoursesController {
  constructor(private readonly courses: CoursesService) {}

  @Get()
  coursesPage(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ) {
    return this.courses.coursesPage(page, pageSize);
  }

  @Get('enrollment-counts')
  enrollmentCounts() {
    return this.courses.enrollmentCounts();
  }

  @Get(':id/students')
  studentsByCourse(@Param('id', ParseIntPipe) id: number) {
    return this.courses.studentsByCourse(id);
  }
}
