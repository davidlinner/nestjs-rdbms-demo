import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Enrollment } from './enrollment.entity.js';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly dataSource: DataSource) {}

  // #region tx-change-course
  // Both writes succeed together or not at all.
  changeCourse(studentId: number, fromCourseId: number, toCourseId: number) {
    return this.dataSource.transaction(async (manager) => {
      // Use the transaction's manager, not injected repositories
      const deleted = await manager.delete(Enrollment, {
        student: { id: studentId },
        course: { id: fromCourseId },
      });
      if (!deleted.affected) {
        throw new NotFoundException('Student is not enrolled in the source course');
      }
      const enrollment = manager.create(Enrollment, {
        student: { id: studentId },
        course: { id: toCourseId },
      });
      return manager.save(enrollment); // fails if already enrolled -> rollback
    });
  }
  // #endregion tx-change-course
}
