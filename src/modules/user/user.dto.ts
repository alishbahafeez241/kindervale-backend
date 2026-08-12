import { Transform, Type } from "class-transformer";
import { IsEmail, IsEnum, IsIn, IsInt, IsOptional, IsString, Matches, Max, Min, MinLength } from "class-validator";
import { normalizeUserRole } from "common/role-normalizer";
import { Trim } from "common/transformer";
import { userRoleEnum, userStatusEnum, type UserRole, type UserStatus } from "models/users";

export class CreateUserDto {
  @IsString({ message: "Name must be a string" })
  @Matches(/^[a-zA-Z\s]+$/, { message: "Name can only contain letters and spaces" })
  @Trim()
  name: string;

  @IsString({ message: "Username must be a string" })
  @Matches(/^[a-zA-Z0-9._-]+$/, { message: "Username can only contain letters, numbers, dots, underscores, and hyphens" })
  @Trim()
  username: string;

  @IsEmail({}, { message: "Email must be valid" })
  @Trim()
  email: string;

  @IsString({ message: "Password must be a string" })
  @MinLength(6, { message: "Password must be at least 6 characters" })
  password: string;

  @Transform(({ value }) => normalizeUserRole(value))
  @IsEnum(userRoleEnum.enumValues, {
    message: `Role must be one of: ${userRoleEnum.enumValues.join(", ")}`
  })
  role: UserRole;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: "Name must be a string" })
  @Matches(/^[a-zA-Z\s]+$/, { message: "Name can only contain letters and spaces" })
  @Trim()
  name?: string;

  @IsOptional()
  @IsString({ message: "Username must be a string" })
  @Matches(/^[a-zA-Z0-9._-]+$/, { message: "Username can only contain letters, numbers, dots, underscores, and hyphens" })
  @Trim()
  username?: string;

  @IsOptional()
  @IsEmail({}, { message: "Email must be valid" })
  @Trim()
  email?: string;

  @IsOptional()
  @IsString({ message: "Password must be a string" })
  @MinLength(6, { message: "Password must be at least 6 characters" })
  password?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeUserRole(value))
  @IsEnum(userRoleEnum.enumValues, {
    message: `Role must be one of: ${userRoleEnum.enumValues.join(", ")}`
  })
  role?: UserRole;

  @IsOptional()
  @IsEnum(userStatusEnum.enumValues, {
    message: `Status must be one of: ${userStatusEnum.enumValues.join(", ")}`
  })
  status?: UserStatus;
}

export class UserListQueryDto {
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
  @Transform(({ value }) => normalizeUserRole(value))
  @IsEnum(userRoleEnum.enumValues, {
    message: `Role must be one of: ${userRoleEnum.enumValues.join(", ")}`
  })
  role?: UserRole;

  @IsOptional()
  @IsEnum(userStatusEnum.enumValues, {
    message: `Status must be one of: ${userStatusEnum.enumValues.join(", ")}`
  })
  status?: UserStatus;

  @IsOptional()
  @IsIn(["name", "username", "email", "role", "status", "createdAt"], {
    message: "Sort by must be one of: name, username, email, role, status, createdAt"
  })
  sortBy?: "name" | "username" | "email" | "role" | "status" | "createdAt" = "createdAt";

  @IsOptional()
  @IsIn(["asc", "desc"], { message: "Sort order must be asc or desc" })
  sortOrder?: "asc" | "desc" = "desc";
}
