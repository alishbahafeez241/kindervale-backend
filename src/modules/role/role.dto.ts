import { IsArray, IsEnum, IsOptional, IsString } from "class-validator";
import { Trim } from "common/transformer";
import { permissionActionEnum, type PermissionAction } from "models/roles";
import { userRoleEnum, type UserRole } from "models/users";

export class CreateRoleDto {
  @IsEnum(userRoleEnum.enumValues, {
    message: `Role must be one of: ${userRoleEnum.enumValues.join(", ")}`
  })
  name: UserRole;

  @IsOptional()
  @IsString({ message: "Description must be a string" })
  @Trim()
  description?: string;
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString({ message: "Description must be a string" })
  @Trim()
  description?: string;
}

export class CreatePermissionDto {
  @IsString({ message: "Module must be a string" })
  @Trim()
  module: string;

  @IsEnum(permissionActionEnum.enumValues, {
    message: `Action must be one of: ${permissionActionEnum.enumValues.join(", ")}`
  })
  action: PermissionAction;

  @IsOptional()
  @IsString({ message: "Description must be a string" })
  @Trim()
  description?: string;
}

export class UpdatePermissionDto {
  @IsOptional()
  @IsString({ message: "Description must be a string" })
  @Trim()
  description?: string;
}

export class AssignPermissionsDto {
  @IsArray({ message: "Permission IDs must be an array" })
  @IsString({ each: true, message: "Each permission ID must be a string" })
  permissionIds: string[];
}

export class PermissionCheckDto {
  @IsString({ message: "Module must be a string" })
  @Trim()
  module: string;

  @IsEnum(permissionActionEnum.enumValues, {
    message: `Action must be one of: ${permissionActionEnum.enumValues.join(", ")}`
  })
  action: PermissionAction;
}
