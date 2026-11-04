import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './course.entity.js';
import { Student } from './student.entity.js';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courses: Repository<Course>,
    @InjectRepository(Student)
    private readonly students: Repository<Student>,
  ) {}

  // #region qb-students-by-course
  studentsByCourse(courseId: number) {
    return this.students
      .createQueryBuilder('student')
      .innerJoin('student.enrollments', 'enrollment')
      .where('enrollment.course = :courseId', { courseId }) // named parameter
      .orderBy('student.lastName', 'ASC')
      .getMany();
  }
  // #endregion qb-students-by-course

  // #region qb-enrollment-count
  enrollmentCounts() {
    return this.courses
      .createQueryBuilder('course')
      .leftJoin('course.enrollments', 'enrollment')
      .select('course.title', 'title')
      .addSelect('COUNT(enrollment.id)', 'enrollments')
      .groupBy('course.id')
      .orderBy('course.title', 'ASC')
      .getRawMany<{ title: string; enrollments: string }>();
  }
  // #endregion qb-enrollment-count

  // #region qb-pagination
  async coursesPage(page: number, pageSize: number) {
    const [items, total] = await this.courses
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.lecturer', 'lecturer')
      .orderBy('course.title', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return { items, total, page, pageSize };
  }
  // #endregion qb-pagination
}
