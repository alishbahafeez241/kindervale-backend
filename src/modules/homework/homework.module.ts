import { Module } from "@nestjs/common";
import { HomeworkController } from "modules/homework/homework.controller";
import { HomeworkService } from "modules/homework/homework.service";

@Module({
  controllers: [HomeworkController],
  providers: [HomeworkService],
  exports: [HomeworkService]
})
export class HomeworkModule {}
