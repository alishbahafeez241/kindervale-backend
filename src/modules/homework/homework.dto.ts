import { Type } from "class-transformer";
import { IsDateString, IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Trim } from "common/transformer";

export class CreateHomeworkDto {
  @IsString({ message: "Title must be a string" })
  @Trim()
  title: string;

  @IsOptional()
  @IsString({ message: "Description must be a string" })
  @Trim()
  description?: string;

  @IsOptional()
  @IsString({ message: "Class ID must be a string" })
  @Trim()
  classId?: string;

  @IsOptional()
  @IsString({ message: "Subject ID must be a string" })
  @Trim()
  subjectId?: string;

  @IsOptional()
  @IsString({ message: "Teacher ID must be a string" })
  @Trim()
  teacherId?: string;

  @IsString({ message: "Class name must be a string" })
  @Trim()
  className: string;

  @IsString({ message: "Subject must be a string" })
  @Trim()
  subject: string;

  @IsDateString({}, { message: "Due date must be a valid date" })
  dueDate: string;
}

export class UpdateHomeworkDto {
  @IsOptional()
  @IsString({ message: "Title must be a string" })
  @Trim()
  title?: string;

  @IsOptional()
  @IsString({ message: "Description must be a string" })
  @Trim()
  description?: string;

  @IsOptional()
  @IsString({ message: "Class ID must be a string" })
  @Trim()
  classId?: string;

  @IsOptional()
  @IsString({ message: "Subject ID must be a string" })
  @Trim()
  subjectId?: string;

  @IsOptional()
  @IsString({ message: "Teacher ID must be a string" })
  @Trim()
  teacherId?: string;

  @IsOptional()
  @IsString({ message: "Class name must be a string" })
  @Trim()
  className?: string;

  @IsOptional()
  @IsString({ message: "Subject must be a string" })
  @Trim()
  subject?: string;

  @IsOptional()
  @IsDateString({}, { message: "Due date must be a valid date" })
  dueDate?: string;
}

export class HomeworkListQueryDto {
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
  @IsString({ message: "Search must be a string" })
  @Trim()
  search?: string;

  @IsOptional()
  @IsString({ message: "Class ID must be a string" })
  @Trim()
  classId?: string;

  @IsOptional()
  @IsString({ message: "Class name must be a string" })
  @Trim()
  className?: string;

  @IsOptional()
  @IsString({ message: "Subject ID must be a string" })
  @Trim()
  subjectId?: string;

  @IsOptional()
  @IsString({ message: "Teacher ID must be a string" })
  @Trim()
  teacherId?: string;

  @IsOptional()
  @IsDateString({}, { message: "From date must be a valid date" })
  fromDate?: string;

  @IsOptional()
  @IsDateString({}, { message: "To date must be a valid date" })
  toDate?: string;

  @IsOptional()
  @IsIn(["title", "className", "subject", "dueDate", "createdAt"], {
    message: "Sort by must be one of: title, className, subject, dueDate, createdAt"
  })
  sortBy?: "title" | "className" | "subject" | "dueDate" | "createdAt" = "dueDate";

  @IsOptional()
  @IsIn(["asc", "desc"], { message: "Sort order must be asc or desc" })
  sortOrder?: "asc" | "desc" = "desc";
}
