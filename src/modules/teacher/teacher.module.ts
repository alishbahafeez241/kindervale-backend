import { Module } from "@nestjs/common";
import { TeacherController } from "modules/teacher/teacher.controller";
import { TeacherService } from "modules/teacher/teacher.service";

@Module({
  controllers: [TeacherController],
  providers: [TeacherService]
})
export class TeacherModule {}
