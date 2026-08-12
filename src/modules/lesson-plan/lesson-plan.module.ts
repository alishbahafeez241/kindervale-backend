import { Module } from "@nestjs/common";
import { DatabaseModule } from "modules/database/database.module";
import { RoleModule } from "modules/role/role.module";
import { LessonPlanController } from "modules/lesson-plan/lesson-plan.controller";
import { LessonPlanService } from "modules/lesson-plan/lesson-plan.service";

@Module({
  imports: [DatabaseModule, RoleModule],
  controllers: [LessonPlanController],
  providers: [LessonPlanService],
  exports: [LessonPlanService]
})
export class LessonPlanModule {}
