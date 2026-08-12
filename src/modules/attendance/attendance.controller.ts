import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ParamDto } from "common/common.dto";
import { AuthGuard } from "middleware/auth.guard";
import { RequirePermission } from "middleware/permission.decorator";
import { PermissionGuard } from "middleware/permission.guard";
import { User } from "middleware/user.decorator";
import {
  AttendanceListQueryDto,
  BulkMarkAttendanceDto,
  CreateAttendanceDto,
  UpdateAttendanceDto
} from "modules/attendance/attendance.dto";
import { AttendanceService } from "modules/attendance/attendance.service";

@UseGuards(AuthGuard, PermissionGuard)
@Controller("attendance")
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @RequirePermission("attendance", "CREATE")
  @Post()
  async createAttendance(@Body() dto: CreateAttendanceDto, @User("userId") userId: string) {
    return { data: await this.attendanceService.createAttendance(dto, userId) };
  }

  @RequirePermission("attendance", "CREATE")
  @Post("bulk")
  async bulkMarkAttendance(@Body() dto: BulkMarkAttendanceDto, @User("userId") userId: string) {
    return { data: await this.attendanceService.bulkMarkAttendance(dto, userId) };
  }

  @RequirePermission("attendance", "READ")
  @Get()
  async getAttendance(@Query() query: AttendanceListQueryDto) {
    return { data: await this.attendanceService.getAttendance(query) };
  }

  @RequirePermission("attendance", "READ")
  @Get(":id")
  async getAttendanceRecord(@Param() { id }: ParamDto) {
    return { data: await this.attendanceService.getAttendanceRecord(id) };
  }

  @RequirePermission("attendance", "UPDATE")
  @Patch(":id")
  async updateAttendance(@Param() { id }: ParamDto, @Body() dto: UpdateAttendanceDto, @User("userId") userId: string) {
    return { data: await this.attendanceService.updateAttendance(id, dto, userId) };
  }

  @RequirePermission("attendance", "DELETE")
  @Delete(":id")
  async deleteAttendance(@Param() { id }: ParamDto) {
    await this.attendanceService.deleteAttendance(id);
    return { message: "Attendance record deleted successfully" };
  }
}
