import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  Unique,
} from 'typeorm';
import { Course } from './course.entity.js';
import { Student } from './student.entity.js';

// #region entity-enrollment
@Entity()
@Unique(['student', 'course']) // a student enrolls in a course only once
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  // German scale 1.0 (best) to 5.0; NULL until graded.
  // PostgreSQL numeric values arrive as strings, e.g. "1.3".
  @Column('numeric', { precision: 2, scale: 1, nullable: true })
  grade: string | null;

  @CreateDateColumn()
  enrolledAt: Date;

  @ManyToOne(() => Student, (student) => student.enrollments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  student: Relation<Student>;

  @ManyToOne(() => Course, (course) => course.enrollments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  course: Relation<Course>;
}
// #endregion entity-enrollment
