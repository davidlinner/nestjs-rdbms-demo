// Homework H3: this endpoint has an N+1 problem.
// 1. Call GET /homework/students-with-cards and watch the query log.
// 2. Fix it so that one request runs exactly one query.
import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentCard } from '../university/student-card.entity.js';
import { Student } from '../university/student.entity.js';

@Controller('homework')
export class StudentsWithCardsController {
  constructor(
    @InjectRepository(Student)
    private readonly students: Repository<Student>,
    @InjectRepository(StudentCard)
    private readonly cards: Repository<StudentCard>,
  ) {}

  @Get('students-with-cards')
  async studentsWithCards() {
    const students = await this.students.find({ order: { id: 'ASC' } });
    const result: Array<Student & { cardNumber: string | null }> = [];
    for (const student of students) {
      const [card] = await this.cards.findBy({ student: { id: student.id } });
      result.push({ ...student, cardNumber: card?.cardNumber ?? null });
    }
    return result;
  }
}
