import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Course } from './course.entity.js';

// #region entity-lecturer
@Entity()
export class Lecturer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  // #region relation-lecturer-courses-inverse
  // Inverse side: no column in "lecturer"
  @OneToMany(() => Course, (course) => course.lecturer)
  courses: Relation<Course[]>;
  // #endregion relation-lecturer-courses-inverse
}
// #endregion entity-lecturer
