// Reference solution for homework H2: POST /courses/:id/enrollments { studentId }
import { Body, Controller, HttpCode, Param, ParseIntPipe, Post } from '@nestjs/common';
import { EnrollService } from './enroll.service.js';

@Controller('courses')
export class EnrollController {
  constructor(private readonly enrollService: EnrollService) {}

  @Post(':id/enrollments')
  @HttpCode(201)
  enroll(
    @Param('id', ParseIntPipe) courseId: number,
    @Body() body: { studentId: number },
  ) {
    return this.enrollService.enroll(courseId, body.studentId);
  }
}
