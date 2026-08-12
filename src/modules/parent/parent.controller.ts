import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ParamDto } from "common/common.dto";
import { AuthGuard } from "middleware/auth.guard";
import { RequirePermission } from "middleware/permission.decorator";
import { PermissionGuard } from "middleware/permission.guard";
import { CreateParentDto, ParentListQueryDto, UpdateParentDto } from "modules/parent/parent.dto";
import { ParentService } from "modules/parent/parent.service";

@UseGuards(AuthGuard, PermissionGuard)
@Controller("parents")
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @RequirePermission("parents", "CREATE")
  @Post()
  async createParent(@Body() dto: CreateParentDto) {
    return { data: await this.parentService.createParent(dto) };
  }

  @RequirePermission("parents", "READ")
  @Get()
  async getParents(@Query() query: ParentListQueryDto) {
    return { data: await this.parentService.getParents(query) };
  }

  @RequirePermission("parents", "READ")
  @Get(":id")
  async getParent(@Param() { id }: ParamDto) {
    return { data: await this.parentService.getParent(id) };
  }

  @RequirePermission("parents", "READ")
  @Get(":id/students")
  async getParentStudents(@Param() { id }: ParamDto) {
    return { data: await this.parentService.getParentStudents(id) };
  }

  @RequirePermission("parents", "UPDATE")
  @Patch(":id")
  async updateParent(@Param() { id }: ParamDto, @Body() dto: UpdateParentDto) {
    return { data: await this.parentService.updateParent(id, dto) };
  }

  @RequirePermission("parents", "DELETE")
  @Delete(":id")
  async deleteParent(@Param() { id }: ParamDto) {
    await this.parentService.deleteParent(id);
    return { message: "Parent deleted successfully" };
  }
}
