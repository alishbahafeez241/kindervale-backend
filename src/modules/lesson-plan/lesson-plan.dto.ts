import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Trim } from "common/transformer";
import { lessonPlanStatusEnum, type LessonPlanStatus } from "models/school";

export class CreateLessonPlanDto {
  @IsOptional()
  @IsString({ message: "Teacher ID must be a string" })
  @Trim()
  teacherId?: string;

  @IsString({ message: "Class ID must be a string" })
  @Trim()
  classId: string;

  @IsOptional()
  @IsString({ message: "Subject ID must be a string" })
  @Trim()
  subjectId?: string;

  @IsString({ message: "Subject must be a string" })
  @Trim()
  subject: string;

  @IsDateString({}, { message: "Week start date must be a valid date" })
  weekStartDate: string;

  @IsString({ message: "Objectives must be a string" })
  @Trim()
  objectives: string;

  @IsString({ message: "Activities must be a string" })
  @Trim()
  activities: string;

  @IsOptional()
  @IsString({ message: "Resources must be a string" })
  @Trim()
  resources?: string;
}

export class UpdateLessonPlanDto {
  @IsOptional()
  @IsString({ message: "Class ID must be a string" })
  @Trim()
  classId?: string;

  @IsOptional()
  @IsString({ message: "Subject ID must be a string" })
  @Trim()
  subjectId?: string;

  @IsOptional()
  @IsString({ message: "Subject must be a string" })
  @Trim()
  subject?: string;

  @IsOptional()
  @IsDateString({}, { message: "Week start date must be a valid date" })
  weekStartDate?: string;

  @IsOptional()
  @IsString({ message: "Objectives must be a string" })
  @Trim()
  objectives?: string;

  @IsOptional()
  @IsString({ message: "Activities must be a string" })
  @Trim()
  activities?: string;

  @IsOptional()
  @IsString({ message: "Resources must be a string" })
  @Trim()
  resources?: string;
}

export class ReviewLessonPlanDto {
  @IsOptional()
  @IsEnum(["APPROVED", "REJECTED"], { message: "Status must be APPROVED or REJECTED" })
  status?: "APPROVED" | "REJECTED";

  @IsOptional()
  @IsString({ message: "Review remarks must be a string" })
  @Trim()
  reviewRemarks?: string;
}

export class LessonPlanListQueryDto {
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
  @IsString({ message: "Teacher ID must be a string" })
  @Trim()
  teacherId?: string;

  @IsOptional()
  @IsString({ message: "Class ID must be a string" })
  @Trim()
  classId?: string;

  @IsOptional()
  @IsEnum(lessonPlanStatusEnum.enumValues)
  status?: LessonPlanStatus;

  @IsOptional()
  @IsIn(["weekStartDate", "status", "createdAt"], { message: "Sort by must be one of: weekStartDate, status, createdAt" })
  sortBy?: "weekStartDate" | "status" | "createdAt" = "createdAt";

  @IsOptional()
  @IsIn(["asc", "desc"], { message: "Sort order must be asc or desc" })
  sortOrder?: "asc" | "desc" = "desc";
}
