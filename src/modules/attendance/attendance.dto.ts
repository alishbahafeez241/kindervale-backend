import { Type } from "class-transformer";
import { IsArray, IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator";
import { Trim } from "common/transformer";
import { studentAttendanceStatusEnum, type StudentAttendanceStatus } from "models/school";

export class CreateAttendanceDto {
  @IsString({ message: "Student ID must be a string" })
  @Trim()
  studentId: string;

  @IsOptional()
  @IsString({ message: "Class ID must be a string" })
  @Trim()
  classId?: string;

  @IsDateString({}, { message: "Date must be a valid date" })
  date: string;

  @IsEnum(studentAttendanceStatusEnum.enumValues, {
    message: `Status must be one of: ${studentAttendanceStatusEnum.enumValues.join(", ")}`
  })
  status: StudentAttendanceStatus;

  @IsOptional()
  @IsString({ message: "Remarks must be a string" })
  @Trim()
  remarks?: string;
}

export class UpdateAttendanceDto {
  @IsOptional()
  @IsString({ message: "Class ID must be a string" })
  @Trim()
  classId?: string;

  @IsOptional()
  @IsDateString({}, { message: "Date must be a valid date" })
  date?: string;

  @IsOptional()
  @IsEnum(studentAttendanceStatusEnum.enumValues, {
    message: `Status must be one of: ${studentAttendanceStatusEnum.enumValues.join(", ")}`
  })
  status?: StudentAttendanceStatus;

  @IsOptional()
  @IsString({ message: "Remarks must be a string" })
  @Trim()
  remarks?: string;
}

export class AttendanceListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Page must be an integer" })
  @Min(1, { message: "Page must be at least 1" })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Limit must be an integer" })
  @Min(1, { message: "Limit must be at least 1" })
  @Max(100, { message: "Limit cannot exceed 100" })
  limit?: number = 10;

  @IsOptional()
  @IsString({ message: "Student ID must be a string" })
  @Trim()
  studentId?: string;

  @IsOptional()
  @IsString({ message: "Class ID must be a string" })
  @Trim()
  classId?: string;

  @IsOptional()
  @IsDateString({}, { message: "From date must be a valid date" })
  fromDate?: string;

  @IsOptional()
  @IsDateString({}, { message: "To date must be a valid date" })
  toDate?: string;

  @IsOptional()
  @IsEnum(studentAttendanceStatusEnum.enumValues, {
    message: `Status must be one of: ${studentAttendanceStatusEnum.enumValues.join(", ")}`
  })
  status?: StudentAttendanceStatus;

  @IsOptional()
  @IsIn(["date", "status", "createdAt"], { message: "Sort by must be one of: date, status, createdAt" })
  sortBy?: "date" | "status" | "createdAt" = "date";

  @IsOptional()
  @IsIn(["asc", "desc"], { message: "Sort order must be asc or desc" })
  sortOrder?: "asc" | "desc" = "desc";
}

export class BulkAttendanceItemDto {
  @IsString({ message: "Student ID must be a string" })
  @Trim()
  studentId: string;

  @IsEnum(studentAttendanceStatusEnum.enumValues, {
    message: `Status must be one of: ${studentAttendanceStatusEnum.enumValues.join(", ")}`
  })
  status: StudentAttendanceStatus;

  @IsOptional()
  @IsString({ message: "Remarks must be a string" })
  @Trim()
  remarks?: string;
}

export class BulkMarkAttendanceDto {
  @IsOptional()
  @IsString({ message: "Class ID must be a string" })
  @Trim()
  classId?: string;

  @IsDateString({}, { message: "Date must be a valid date" })
  date: string;

  @IsArray({ message: "Records must be an array" })
  @ValidateNested({ each: true })
  @Type(() => BulkAttendanceItemDto)
  records: BulkAttendanceItemDto[];
}
