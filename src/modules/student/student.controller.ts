import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ParamDto } from "common/common.dto";
import { AuthGuard } from "middleware/auth.guard";
import { RequirePermission } from "middleware/permission.decorator";
import { PermissionGuard } from "middleware/permission.guard";
import { CreateStudentDto, StudentListQueryDto, UpdateStudentDto } from "modules/student/student.dto";
import { StudentService } from "modules/student/student.service";

@UseGuards(AuthGuard, PermissionGuard)
@Controller("students")
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @RequirePermission("students", "CREATE")
  @Post()
  async createStudent(@Body() dto: CreateStudentDto) {
    return { data: await this.studentService.createStudent(dto) };
  }

  @RequirePermission("students", "READ")
  @Get()
  async getStudents(@Query() query: StudentListQueryDto) {
    return { data: await this.studentService.getStudents(query) };
  }

  @RequirePermission("students", "READ")
  @Get(":id")
  async getStudent(@Param() { id }: ParamDto) {
    return { data: await this.studentService.getStudent(id) };
  }

  @RequirePermission("students", "UPDATE")
  @Patch(":id")
  async updateStudent(@Param() { id }: ParamDto, @Body() dto: UpdateStudentDto) {
    return { data: await this.studentService.updateStudent(id, dto) };
  }

  @RequirePermission("students", "DELETE")
  @Delete(":id")
  async deleteStudent(@Param() { id }: ParamDto) {
    await this.studentService.deleteStudent(id);
    return { message: "Student deleted successfully" };
  }
}
