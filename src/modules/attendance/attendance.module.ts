import { Module } from "@nestjs/common";
import { AttendanceController } from "modules/attendance/attendance.controller";
import { AttendanceService } from "modules/attendance/attendance.service";

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService]
})
export class AttendanceModule {}
