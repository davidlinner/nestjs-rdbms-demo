import { Body, Controller, Get, Post } from '@nestjs/common';
import { type CreateStudent, StudentsService } from './students.service.js';

@Controller('students')
export class StudentsController {
  constructor(private readonly students: StudentsService) {}

  @Get()
  findAll() {
    return this.students.findAll();
  }

  @Post()
  create(@Body() body: CreateStudent) {
    return this.students.create(body);
  }
}
