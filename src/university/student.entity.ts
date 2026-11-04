import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Enrollment } from './enrollment.entity.js';
import { StudentCard } from './student-card.entity.js';

// #region entity-student
@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ unique: true })
  email: string;

  // #region relation-student-enrollments
  @OneToMany(() => Enrollment, (enrollment) => enrollment.student)
  enrollments: Relation<Enrollment[]>;
  // #endregion relation-student-enrollments

  @OneToOne(() => StudentCard, (card) => card.student)
  card: Relation<StudentCard> | null;
}
// #endregion entity-student
