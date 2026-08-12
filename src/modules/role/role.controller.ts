import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ParamDto } from "common/common.dto";
import { AuthGuard } from "middleware/auth.guard";
import { RequirePermission } from "middleware/permission.decorator";
import { PermissionGuard } from "middleware/permission.guard";
import {
  AssignPermissionsDto,
  CreatePermissionDto,
  CreateRoleDto,
  UpdatePermissionDto,
  UpdateRoleDto
} from "modules/role/role.dto";
import { RoleService } from "modules/role/role.service";

@UseGuards(AuthGuard, PermissionGuard)
@Controller()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @RequirePermission("roles", "CREATE")
  @Post("roles")
  async createRole(@Body() dto: CreateRoleDto) {
    return { data: await this.roleService.createRole(dto) };
  }

  @RequirePermission("roles", "READ")
  @Get("roles")
  async getRoles() {
    return { data: await this.roleService.getRoles() };
  }

  @RequirePermission("roles", "READ")
  @Get("roles/:id")
  async getRole(@Param() { id }: ParamDto) {
    return { data: await this.roleService.getRole(id) };
  }

  @RequirePermission("roles", "UPDATE")
  @Patch("roles/:id")
  async updateRole(@Param() { id }: ParamDto, @Body() dto: UpdateRoleDto) {
    return { data: await this.roleService.updateRole(id, dto) };
  }

  @RequirePermission("roles", "DELETE")
  @Delete("roles/:id")
  async deleteRole(@Param() { id }: ParamDto) {
    await this.roleService.deleteRole(id);
    return { message: "Role deleted successfully" };
  }

  @RequirePermission("permissions", "CREATE")
  @Post("permissions")
  async createPermission(@Body() dto: CreatePermissionDto) {
    return { data: await this.roleService.createPermission(dto) };
  }

  @RequirePermission("permissions", "READ")
  @Get("permissions")
  async getPermissions() {
    return { data: await this.roleService.getPermissions() };
  }

  @RequirePermission("permissions", "READ")
  @Get("permissions/:id")
  async getPermission(@Param() { id }: ParamDto) {
    return { data: await this.roleService.getPermission(id) };
  }

  @RequirePermission("permissions", "UPDATE")
  @Patch("permissions/:id")
  async updatePermission(@Param() { id }: ParamDto, @Body() dto: UpdatePermissionDto) {
    return { data: await this.roleService.updatePermission(id, dto) };
  }

  @RequirePermission("permissions", "DELETE")
  @Delete("permissions/:id")
  async deletePermission(@Param() { id }: ParamDto) {
    await this.roleService.deletePermission(id);
    return { message: "Permission deleted successfully" };
  }

  @RequirePermission("roles", "UPDATE")
  @Post("roles/:id/permissions")
  async assignPermissions(@Param() { id }: ParamDto, @Body() dto: AssignPermissionsDto) {
    return { data: await this.roleService.assignPermissions(id, dto) };
  }

  @RequirePermission("roles", "READ")
  @Get("roles/:id/permissions")
  async getRolePermissions(@Param() { id }: ParamDto) {
    return { data: await this.roleService.getRolePermissions(id) };
  }

  @RequirePermission("roles", "MANAGE")
  @Post("roles/seed-defaults")
  async seedDefaults() {
    return { message: "Default roles and permissions seeded", data: await this.roleService.seedDefaults() };
  }
}
