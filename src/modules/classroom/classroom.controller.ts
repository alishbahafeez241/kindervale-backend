import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ParamDto } from "common/common.dto";
import { AuthGuard } from "middleware/auth.guard";
import { RequirePermission } from "middleware/permission.decorator";
import { PermissionGuard } from "middleware/permission.guard";
import {
  ClassListQueryDto,
  CreateClassDto,
  CreateSectionDto,
  SectionListQueryDto,
  UpdateClassDto,
  UpdateSectionDto
} from "modules/classroom/classroom.dto";
import { ClassroomService } from "modules/classroom/classroom.service";

@UseGuards(AuthGuard, PermissionGuard)
@Controller()
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

  @RequirePermission("classes", "CREATE")
  @Post("classes")
  async createClass(@Body() dto: CreateClassDto) {
    return { data: await this.classroomService.createClass(dto) };
  }

  @RequirePermission("classes", "READ")
  @Get("classes")
  async getClasses(@Query() query: ClassListQueryDto) {
    return { data: await this.classroomService.getClasses(query) };
  }

  @RequirePermission("classes", "READ")
  @Get("classes/:id")
  async getClass(@Param() { id }: ParamDto) {
    return { data: await this.classroomService.getClass(id) };
  }

  @RequirePermission("classes", "UPDATE")
  @Patch("classes/:id")
  async updateClass(@Param() { id }: ParamDto, @Body() dto: UpdateClassDto) {
    return { data: await this.classroomService.updateClass(id, dto) };
  }

  @RequirePermission("classes", "DELETE")
  @Delete("classes/:id")
  async deleteClass(@Param() { id }: ParamDto) {
    await this.classroomService.deleteClass(id);
    return { message: "Class deleted successfully" };
  }

  @RequirePermission("sections", "CREATE")
  @Post("sections")
  async createSection(@Body() dto: CreateSectionDto) {
    return { data: await this.classroomService.createSection(dto) };
  }

  @RequirePermission("sections", "READ")
  @Get("sections")
  async getSections(@Query() query: SectionListQueryDto) {
    return { data: await this.classroomService.getSections(query) };
  }

  @RequirePermission("sections", "READ")
  @Get("sections/:id")
  async getSection(@Param() { id }: ParamDto) {
    return { data: await this.classroomService.getSection(id) };
  }

  @RequirePermission("sections", "UPDATE")
  @Patch("sections/:id")
  async updateSection(@Param() { id }: ParamDto, @Body() dto: UpdateSectionDto) {
    return { data: await this.classroomService.updateSection(id, dto) };
  }

  @RequirePermission("sections", "DELETE")
  @Delete("sections/:id")
  async deleteSection(@Param() { id }: ParamDto) {
    await this.classroomService.deleteSection(id);
    return { message: "Section deleted successfully" };
  }
}
