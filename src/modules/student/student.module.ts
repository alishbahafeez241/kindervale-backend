import { Module } from "@nestjs/common";
import { StudentController } from "modules/student/student.controller";
import { StudentService } from "modules/student/student.service";

@Module({
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService]
})
export class StudentModule {}
