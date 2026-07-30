import { IsArray, IsOptional, IsString } from "class-validator";
import { Trim } from "common/transformer";

export class CreateAdminDto {
  @IsString({ message: "User ID must be a string" })
  @Trim()
  userId: string;

  @IsOptional()
  @IsString({ message: "Phone must be a string" })
  @Trim()
  phone?: string;

  @IsOptional()
  @IsString({ message: "Designation must be a string" })
  @Trim()
  designation?: string;

  @IsOptional()
  @IsArray({ message: "Permissions must be an array" })
  permissions?: string[];
}

export class UpdateAdminDto {
  @IsOptional()
  @IsString({ message: "Phone must be a string" })
  @Trim()
  phone?: string;

  @IsOptional()
  @IsString({ message: "Designation must be a string" })
  @Trim()
  designation?: string;

  @IsOptional()
  @IsArray({ message: "Permissions must be an array" })
  permissions?: string[];
}
