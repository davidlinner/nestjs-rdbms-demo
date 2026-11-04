import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsWithCardsController } from '../homework/students-with-cards.controller.js';
import { CoursesController } from './courses.controller.js';
import { CoursesService } from './courses.service.js';
import { Course } from './course.entity.js';
import { EnrollmentsController } from './enrollments.controller.js';
import { EnrollmentsService } from './enrollments.service.js';
import { Enrollment } from './enrollment.entity.js';
import { LecturersController } from './lecturers.controller.js';
import { LecturersService } from './lecturers.service.js';
import { Lecturer } from './lecturer.entity.js';
import { ReportsController } from './reports.controller.js';
import { ReportsService } from './reports.service.js';
import { StudentCard } from './student-card.entity.js';
import { Student } from './student.entity.js';
import { StudentsController } from './students.controller.js';
import { StudentsService } from './students.service.js';

@Module({
  // #region module-entities
  imports: [
    TypeOrmModule.forFeature([Student, StudentCard, Lecturer, Course, Enrollment]),
  ],
  // #endregion module-entities
  controllers: [
    StudentsController,
    LecturersController,
    CoursesController,
    ReportsController,
    EnrollmentsController,
    StudentsWithCardsController, // homework H3 (copied in by students after the session)
  ],
  providers: [
    StudentsService,
    LecturersService,
    CoursesService,
    ReportsService,
    EnrollmentsService,
  ],
  exports: [TypeOrmModule],
})
export class UniversityModule {}
