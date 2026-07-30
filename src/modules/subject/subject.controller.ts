import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ParamDto } from "common/common.dto";
import { AuthGuard } from "middleware/auth.guard";
import { RequirePermission } from "middleware/permission.decorator";
import { PermissionGuard } from "middleware/permission.guard";
import { CreateSubjectDto, SubjectListQueryDto, UpdateSubjectDto } from "modules/subject/subject.dto";
import { SubjectService } from "modules/subject/subject.service";

@UseGuards(AuthGuard, PermissionGuard)
@Controller("subjects")
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @RequirePermission("subjects", "CREATE")
  @Post()
  async createSubject(@Body() dto: CreateSubjectDto) {
    return { data: await this.subjectService.createSubject(dto) };
  }

  @RequirePermission("subjects", "READ")
  @Get()
  async getSubjects(@Query() query: SubjectListQueryDto) {
    return { data: await this.subjectService.getSubjects(query) };
  }

  @RequirePermission("subjects", "READ")
  @Get(":id")
  async getSubject(@Param() { id }: ParamDto) {
    return { data: await this.subjectService.getSubject(id) };
  }

  @RequirePermission("subjects", "UPDATE")
  @Patch(":id")
  async updateSubject(@Param() { id }: ParamDto, @Body() dto: UpdateSubjectDto) {
    return { data: await this.subjectService.updateSubject(id, dto) };
  }

  @RequirePermission("subjects", "DELETE")
  @Delete(":id")
  async deleteSubject(@Param() { id }: ParamDto) {
    await this.subjectService.deleteSubject(id);
    return { message: "Subject deleted successfully" };
  }
}
