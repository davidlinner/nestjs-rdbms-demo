// Homework H2 reference solution (instructor only).
// The H3 controller is registered in UniversityModule, as students will do it.
import { Module } from '@nestjs/common';
import { UniversityModule } from '../university/university.module.js';
import { EnrollController } from './enroll.controller.js';
import { EnrollService } from './enroll.service.js';

@Module({
  imports: [UniversityModule],
  controllers: [EnrollController],
  providers: [EnrollService],
})
export class HomeworkModule {}
