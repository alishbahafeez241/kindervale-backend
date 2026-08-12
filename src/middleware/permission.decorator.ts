import { SetMetadata } from "@nestjs/common";
import type { PermissionAction } from "models/roles";

export const PERMISSION_KEY = "permission";

export interface PermissionRequirement {
  module: string;
  action: PermissionAction;
}

export const RequirePermission = (module: string, action: PermissionAction) =>
  SetMetadata(PERMISSION_KEY, { module, action } satisfies PermissionRequirement);
