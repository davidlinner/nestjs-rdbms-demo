import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './course.entity.js';

export interface CourseReportRow {
  title: string;
  lecturer: string;
  avgGrade: string; // numeric arrives as string, e.g. "1.50"
  enrollments: string; // COUNT is bigint, also a string
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Course)
    private readonly courses: Repository<Course>,
  ) {}

  // #region qb-report-courses
  coursesWithGoodAverage(maxAvg: number, limit: number, offset: number) {
    return this.courses
      .createQueryBuilder('c')
      .innerJoin('c.lecturer', 'l')
      .leftJoin('c.enrollments', 'e')
      .select('c.title', 'title')
      .addSelect('l.name', 'lecturer')
      .addSelect('ROUND(AVG(e.grade), 2)', 'avgGrade')
      .addSelect('COUNT(e.id)', 'enrollments')
      .groupBy('c.id')
      .addGroupBy('l.id')
      .having('AVG(e.grade) < :maxAvg', { maxAvg })
      .orderBy('"avgGrade"', 'ASC')
      .addOrderBy('c.title', 'ASC')
      .offset(offset)
      .limit(limit)
      .getRawMany<CourseReportRow>();
  }
  // #endregion qb-report-courses
}
