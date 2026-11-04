import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Enrollment } from './enrollment.entity.js';
import { Lecturer } from './lecturer.entity.js';

// #region entity-course
@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  title: string;

  @Column('int')
  ects: number;

  @Column('int', { default: 30 })
  capacity: number;

  // #region relation-lecturer-courses
  // Owning side: "course" gets the foreign key column "lecturerId"
  @ManyToOne(() => Lecturer, (lecturer) => lecturer.courses, { nullable: false })
  lecturer: Relation<Lecturer>;
  // #endregion relation-lecturer-courses

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments: Relation<Enrollment[]>;
}
// #endregion entity-course
