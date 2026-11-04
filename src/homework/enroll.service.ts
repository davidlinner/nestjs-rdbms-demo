// Reference solution for homework H2 (instructor only; not shown on slides,
// not shipped in the starter). Verified by the race e2e test.
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Course } from '../university/course.entity.js';
import { Enrollment } from '../university/enrollment.entity.js';

@Injectable()
export class EnrollService {
  constructor(private readonly dataSource: DataSource) {}

  enroll(courseId: number, studentId: number) {
    return this.dataSource.transaction(async (manager) => {
      // Lock the course row: concurrent enrollments for this course wait here.
      const course = await manager
        .getRepository(Course)
        .createQueryBuilder('course')
        .setLock('pessimistic_write')
        .where('course.id = :courseId', { courseId })
        .getOne();
      if (!course) {
        throw new NotFoundException(`Course ${courseId} not found`);
      }
      const enrolled = await manager.count(Enrollment, {
        where: { course: { id: courseId } },
      });
      if (enrolled >= course.capacity) {
        throw new ConflictException('Course is full');
      }
      return manager.save(
        manager.create(Enrollment, {
          course: { id: courseId },
          student: { id: studentId },
        }),
      );
    });
  }
}
