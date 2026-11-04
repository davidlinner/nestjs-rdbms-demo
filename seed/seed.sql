-- Seed data for "Using SQL Databases from NestJS" (see the teaching concept, section 13).
-- Requires the schema from block 1 (TypeORM default naming). Safe to run repeatedly.

TRUNCATE enrollment, student_card, course, student, lecturer RESTART IDENTITY CASCADE;

INSERT INTO lecturer (id, name, email) VALUES
  (1, 'Ada Lovelace', 'ada.lovelace@uni.example'),
  (2, 'Edgar Codd', 'edgar.codd@uni.example'),
  (3, 'Grace Hopper', 'grace.hopper@uni.example');

INSERT INTO course (id, title, ects, capacity, "lecturerId") VALUES
  (1, 'Databases', 5, 30, 2),
  (2, 'Web Engineering', 5, 25, 3),
  (3, 'Algorithms', 6, 40, 1),
  (4, 'Distributed Systems', 5, 20, 2),
  (5, 'Compilers', 6, 15, 3);

INSERT INTO student (id, "firstName", "lastName", email) VALUES
  (1, 'Mia', 'Becker', 'mia.becker@student.example'),
  (2, 'Noah', 'Schulz', 'noah.schulz@student.example'),
  (3, 'Lea', 'Wagner', 'lea.wagner@student.example'),
  (4, 'Ben', 'Hoffmann', 'ben.hoffmann@student.example'),
  (5, 'Emma', 'Koch', 'emma.koch@student.example'),
  (6, 'Paul', 'Richter', 'paul.richter@student.example'),
  (7, 'Lina', 'Klein', 'lina.klein@student.example'),
  (8, 'Finn', 'Wolf', 'finn.wolf@student.example');

INSERT INTO student_card (id, "cardNumber", "validUntil", "studentId") VALUES
  (1, 'SRH-2026-0001', '2027-09-30', 1),
  (2, 'SRH-2026-0002', '2027-09-30', 2),
  (3, 'SRH-2026-0003', '2027-09-30', 3),
  (4, 'SRH-2026-0004', '2027-09-30', 4),
  (5, 'SRH-2026-0005', '2027-09-30', 5),
  (6, 'SRH-2026-0006', '2027-09-30', 6),
  (7, 'SRH-2026-0007', '2027-09-30', 7),
  (8, 'SRH-2026-0008', '2027-09-30', 8);

-- Average grades: Databases 1.50, Web Engineering 2.23, Algorithms 1.66,
-- Distributed Systems 2.85, Compilers 1.50 (one enrollment not yet graded).
INSERT INTO enrollment (id, grade, "enrolledAt", "studentId", "courseId") VALUES
  (1,  1.3,  '2026-10-01 09:00', 1, 1),
  (2,  1.7,  '2026-10-01 09:05', 2, 1),
  (3,  2.0,  '2026-10-01 09:10', 3, 1),
  (4,  1.0,  '2026-10-01 09:15', 4, 1),
  (5,  2.3,  '2026-10-02 10:00', 5, 2),
  (6,  2.7,  '2026-10-02 10:05', 6, 2),
  (7,  1.7,  '2026-10-02 10:10', 7, 2),
  (8,  1.0,  '2026-10-03 11:00', 1, 3),
  (9,  1.3,  '2026-10-03 11:05', 2, 3),
  (10, 2.0,  '2026-10-03 11:10', 5, 3),
  (11, 2.3,  '2026-10-03 11:15', 6, 3),
  (12, 1.7,  '2026-10-03 11:20', 8, 3),
  (13, 3.0,  '2026-10-04 12:00', 3, 4),
  (14, 2.7,  '2026-10-04 12:05', 4, 4),
  (15, 1.7,  '2026-10-05 13:00', 7, 5),
  (16, 1.3,  '2026-10-05 13:05', 8, 5),
  (17, NULL, '2026-10-05 13:10', 1, 5);

-- Continue the id sequences after the explicit ids above
SELECT setval('lecturer_id_seq', (SELECT MAX(id) FROM lecturer));
SELECT setval('course_id_seq', (SELECT MAX(id) FROM course));
SELECT setval('student_id_seq', (SELECT MAX(id) FROM student));
SELECT setval('student_card_id_seq', (SELECT MAX(id) FROM student_card));
SELECT setval('enrollment_id_seq', (SELECT MAX(id) FROM enrollment));
