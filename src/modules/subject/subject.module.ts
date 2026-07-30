import { Module } from "@nestjs/common";
import { SubjectController } from "modules/subject/subject.controller";
import { SubjectService } from "modules/subject/subject.service";

@Module({
  controllers: [SubjectController],
  providers: [SubjectService],
  exports: [SubjectService]
})
export class SubjectModule {}
