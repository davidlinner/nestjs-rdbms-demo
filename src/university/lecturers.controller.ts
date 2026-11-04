import { Controller, Get } from '@nestjs/common';
import { LecturersService } from './lecturers.service.js';

@Controller('lecturers')
export class LecturersController {
  constructor(private readonly lecturers: LecturersService) {}

  @Get('with-courses')
  findAllWithCourses() {
    return this.lecturers.findAllWithCourses();
  }
}
