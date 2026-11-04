import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './student.entity.js';

export type CreateStudent = Pick<Student, 'firstName' | 'lastName' | 'email'>;

// #region students-service-basic
@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly students: Repository<Student>,
  ) {}

  findAll() {
    return this.students.find({ order: { lastName: 'ASC' } });
  }

  create(data: CreateStudent) {
    const student = this.students.create(data);
    return this.students.save(student);
  }
}
// #endregion students-service-basic
