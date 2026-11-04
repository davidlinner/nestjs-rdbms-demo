import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Student } from './student.entity.js';

// #region entity-student-card
@Entity()
export class StudentCard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true })
  cardNumber: string;

  @Column({ type: 'date' })
  validUntil: string;

  // Owning side: @JoinColumn puts the foreign key "studentId" into student_card
  @OneToOne(() => Student, (student) => student.card, { onDelete: 'CASCADE' })
  @JoinColumn()
  student: Relation<Student>;
}
// #endregion entity-student-card
