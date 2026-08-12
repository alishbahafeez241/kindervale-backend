import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ParamDto } from "common/common.dto";
import { AuthGuard } from "middleware/auth.guard";
import { RequirePermission } from "middleware/permission.decorator";
import { PermissionGuard } from "middleware/permission.guard";
import { User } from "middleware/user.decorator";
import {
  CreateLessonPlanDto,
  LessonPlanListQueryDto,
  ReviewLessonPlanDto,
  UpdateLessonPlanDto
} from "modules/lesson-plan/lesson-plan.dto";
import { LessonPlanService } from "modules/lesson-plan/lesson-plan.service";

@UseGuards(AuthGuard, PermissionGuard)
@Controller("lesson-plans")
export class LessonPlanController {
  constructor(private readonly lessonPlanService: LessonPlanService) {}

  @RequirePermission("lesson-plans", "CREATE")
  @Post()
  async createLessonPlan(@Body() dto: CreateLessonPlanDto, @User("userId") userId: string) {
    return { data: await this.lessonPlanService.createLessonPlan(dto, userId) };
  }

  @RequirePermission("lesson-plans", "READ")
  @Get()
  async getLessonPlans(@Query() query: LessonPlanListQueryDto) {
    return { data: await this.lessonPlanService.getLessonPlans(query) };
  }

  @RequirePermission("lesson-plans", "READ")
  @Get(":id")
  async getLessonPlan(@Param() { id }: ParamDto) {
    return { data: await this.lessonPlanService.getLessonPlan(id) };
  }

  @RequirePermission("lesson-plans", "UPDATE")
  @Patch(":id")
  async updateLessonPlan(@Param() { id }: ParamDto, @Body() dto: UpdateLessonPlanDto) {
    return { data: await this.lessonPlanService.updateLessonPlan(id, dto) };
  }

  @RequirePermission("lesson-plans", "UPDATE")
  @Post(":id/submit")
  async submitLessonPlan(@Param() { id }: ParamDto) {
    return { data: await this.lessonPlanService.submitLessonPlan(id) };
  }

  @RequirePermission("lesson-plans", "UPDATE")
  @Post(":id/review")
  async reviewLessonPlan(@Param() { id }: ParamDto, @Body() dto: ReviewLessonPlanDto, @User("userId") userId: string) {
    return { data: await this.lessonPlanService.reviewLessonPlan(id, dto, userId) };
  }

  @RequirePermission("lesson-plans", "DELETE")
  @Delete(":id")
  async deleteLessonPlan(@Param() { id }: ParamDto) {
    await this.lessonPlanService.deleteLessonPlan(id);
    return { message: "Lesson plan deleted successfully" };
  }
}
