import { Body, ConflictException, Controller, Post } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { EnrollmentsService } from './enrollments.service.js';

interface ChangeCourseBody {
  studentId: number;
  fromCourseId: number;
  toCourseId: number;
}

const UNIQUE_VIOLATION = '23505';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollments: EnrollmentsService) {}

  @Post('change-course')
  async changeCourse(@Body() body: ChangeCourseBody) {
    try {
      return await this.enrollments.changeCourse(
        body.studentId,
        body.fromCourseId,
        body.toCourseId,
      );
    } catch (error) {
      if (error instanceof QueryFailedError && (error.driverError as { code?: string }).code === UNIQUE_VIOLATION) {
        throw new ConflictException('Student is already enrolled in the target course');
      }
      throw error;
    }
  }
}
