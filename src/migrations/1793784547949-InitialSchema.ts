import { MigrationInterface, QueryRunner } from "typeorm";

// #region migration-initial-schema
export class InitialSchema1793784547949 implements MigrationInterface {
    name = 'InitialSchema1793784547949'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "student_card" ("id" SERIAL NOT NULL, "cardNumber" character varying(20) NOT NULL, "validUntil" date NOT NULL, "studentId" integer, CONSTRAINT "UQ_d051cd91daa939e388e67abc464" UNIQUE ("cardNumber"), CONSTRAINT "REL_f5fe720000c2a7fc93ddbc6287" UNIQUE ("studentId"), CONSTRAINT "PK_c361b9c3ca44125857f4fff06f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "student" ("id" SERIAL NOT NULL, "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "email" character varying NOT NULL, CONSTRAINT "UQ_a56c051c91dbe1068ad683f536e" UNIQUE ("email"), CONSTRAINT "PK_3d8016e1cb58429474a3c041904" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "enrollment" ("id" SERIAL NOT NULL, "grade" numeric(2,1), "enrolledAt" TIMESTAMP NOT NULL DEFAULT now(), "studentId" integer NOT NULL, "courseId" integer NOT NULL, CONSTRAINT "UQ_b352a6a586fd38786e2d74facb5" UNIQUE ("studentId", "courseId"), CONSTRAINT "PK_7e200c699fa93865cdcdd025885" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "lecturer" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "email" character varying NOT NULL, CONSTRAINT "UQ_1c241d8627c0cead61a0898e518" UNIQUE ("email"), CONSTRAINT "PK_e9647bfd5a4c128c9cc3e8cf99c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "course" ("id" SERIAL NOT NULL, "title" character varying(100) NOT NULL, "ects" integer NOT NULL, "capacity" integer NOT NULL DEFAULT '30', "lecturerId" integer NOT NULL, CONSTRAINT "PK_bf95180dd756fd204fb01ce4916" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "student_card" ADD CONSTRAINT "FK_f5fe720000c2a7fc93ddbc62874" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "enrollment" ADD CONSTRAINT "FK_5ce702e71b98cc1bb37b81e83d8" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "enrollment" ADD CONSTRAINT "FK_d1a599a7740b4f4bd1120850f04" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course" ADD CONSTRAINT "FK_7963638d0c3e30975e0a818f938" FOREIGN KEY ("lecturerId") REFERENCES "lecturer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course" DROP CONSTRAINT "FK_7963638d0c3e30975e0a818f938"`);
        await queryRunner.query(`ALTER TABLE "enrollment" DROP CONSTRAINT "FK_d1a599a7740b4f4bd1120850f04"`);
        await queryRunner.query(`ALTER TABLE "enrollment" DROP CONSTRAINT "FK_5ce702e71b98cc1bb37b81e83d8"`);
        await queryRunner.query(`ALTER TABLE "student_card" DROP CONSTRAINT "FK_f5fe720000c2a7fc93ddbc62874"`);
        await queryRunner.query(`DROP TABLE "course"`);
        await queryRunner.query(`DROP TABLE "lecturer"`);
        await queryRunner.query(`DROP TABLE "enrollment"`);
        await queryRunner.query(`DROP TABLE "student"`);
        await queryRunner.query(`DROP TABLE "student_card"`);
    }

}
// #endregion migration-initial-schema
