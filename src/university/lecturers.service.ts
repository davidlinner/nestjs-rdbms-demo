import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lecturer } from './lecturer.entity.js';

@Injectable()
export class LecturersService {
  constructor(
    @InjectRepository(Lecturer)
    private readonly lecturers: Repository<Lecturer>,
  ) {}

  // #region repo-find-with-relations
  // One query with a JOIN instead of 1 + N queries
  findAllWithCourses() {
    return this.lecturers.find({
      relations: { courses: true },
      order: { name: 'ASC', courses: { title: 'ASC' } },
    });
  }
  // #endregion repo-find-with-relations
}
