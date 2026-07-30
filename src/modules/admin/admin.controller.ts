import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ParamDto } from "common/common.dto";
import { CreateAdminDto, UpdateAdminDto } from "modules/admin/admin.dto";
import { AdminService } from "modules/admin/admin.service";

@Controller("admins")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  async createAdmin(@Body() dto: CreateAdminDto) {
    const admin = await this.adminService.createAdmin(dto);
    return { data: admin };
  }

  @Get()
  async getAdmins() {
    const admins = await this.adminService.getAdmins();
    return { data: admins };
  }

  @Get(":id")
  async getAdmin(@Param() { id }: ParamDto) {
    const admin = await this.adminService.getAdmin(id);
    return { data: admin };
  }

  @Patch(":id")
  async updateAdmin(@Param() { id }: ParamDto, @Body() dto: UpdateAdminDto) {
    const admin = await this.adminService.updateAdmin(id, dto);
    return { data: admin };
  }

  @Delete(":id")
  async deleteAdmin(@Param() { id }: ParamDto) {
    await this.adminService.deleteAdmin(id);
    return { message: "Admin deleted successfully" };
  }
}
