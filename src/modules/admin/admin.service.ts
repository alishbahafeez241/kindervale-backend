import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import adminsTable, { type Admin } from "models/admins";
import usersTable from "models/users";
import { DatabaseService } from "modules/database/database.service";
import type { CreateAdminDto, UpdateAdminDto } from "modules/admin/admin.dto";

@Injectable()
export class AdminService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createAdmin(dto: CreateAdminDto): Promise<Admin> {
    const [user] = await this.databaseService.db.select().from(usersTable).where(eq(usersTable.id, dto.userId)).limit(1);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.role !== "ADMIN") {
      throw new ConflictException("User role must be ADMIN");
    }

    const [admin] = await this.databaseService.db.insert(adminsTable).values(dto).returning();

    if (!admin) {
      throw new ConflictException("Failed to create admin");
    }

    return admin;
  }

  async getAdmins(): Promise<Admin[]> {
    return await this.databaseService.db.select().from(adminsTable);
  }

  async getAdmin(id: string): Promise<Admin> {
    const [admin] = await this.databaseService.db.select().from(adminsTable).where(eq(adminsTable.id, id)).limit(1);

    if (!admin) {
      throw new NotFoundException("Admin not found");
    }

    return admin;
  }

  async updateAdmin(id: string, dto: UpdateAdminDto): Promise<Admin> {
    const [admin] = await this.databaseService.db
      .update(adminsTable)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(adminsTable.id, id))
      .returning();

    if (!admin) {
      throw new NotFoundException("Admin not found");
    }

    return admin;
  }

  async deleteAdmin(id: string): Promise<void> {
    await this.databaseService.db.delete(adminsTable).where(eq(adminsTable.id, id));
  }
}
