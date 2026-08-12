import { Module } from "@nestjs/common";
import { ClassroomController } from "modules/classroom/classroom.controller";
import { ClassroomService } from "modules/classroom/classroom.service";

@Module({
  controllers: [ClassroomController],
  providers: [ClassroomService],
  exports: [ClassroomService]
})
export class ClassroomModule {}
