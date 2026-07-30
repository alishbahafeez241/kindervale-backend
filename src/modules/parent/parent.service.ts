import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { and, asc, count, desc, eq, ilike, ne, or, type SQL } from "drizzle-orm";
import { parentsTable, studentsTable, type Parent } from "models/school";
import usersTable from "models/users";
import { DatabaseService } from "modules/database/database.service";
import type { CreateParentDto, ParentListQueryDto, UpdateParentDto } from "modules/parent/parent.dto";

@Injectable()
export class ParentService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createParent(dto: CreateParentDto): Promise<Parent> {
    await this.validateUser(dto.userId);
    await this.ensureEmailAvailable(dto.email);

    const [parent] = await this.databaseService.db.insert(parentsTable).values(dto).returning();
    if (!parent) throw new ConflictException("Failed to create parent");
    return parent;
  }

  async getParents(query: ParentListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;
    const where = this.buildParentWhere(query);
    const sortColumn = parentsTable[query.sortBy ?? "createdAt"];
    const orderBy = query.sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

    const [items, [{ total }]] = await Promise.all([
      this.databaseService.db.select().from(parentsTable).where(where).orderBy(orderBy).limit(limit).offset(offset),
      this.databaseService.db.select({ total: count() }).from(parentsTable).where(where)
    ]);

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  async getParent(id: string): Promise<Parent> {
    const [parent] = await this.databaseService.db.select().from(parentsTable).where(eq(parentsTable.id, id)).limit(1);
    if (!parent) throw new NotFoundException("Parent not found");
    return parent;
  }

  async getParentStudents(id: string) {
    await this.getParent(id);
    return this.databaseService.db.select().from(studentsTable).where(eq(studentsTable.parentId, id));
  }

  async updateParent(id: string, dto: UpdateParentDto): Promise<Parent> {
    await this.validateUser(dto.userId);
    if (dto.email) await this.ensureEmailAvailable(dto.email, id);

    const [parent] = await this.databaseService.db
      .update(parentsTable)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(parentsTable.id, id))
      .returning();

    if (!parent) throw new NotFoundException("Parent not found");
    return parent;
  }

  async deleteParent(id: string): Promise<void> {
    const [parent] = await this.databaseService.db
      .delete(parentsTable)
      .where(eq(parentsTable.id, id))
      .returning({ id: parentsTable.id });

    if (!parent) throw new NotFoundException("Parent not found");
  }

  private async validateUser(userId?: string) {
    if (!userId) return;

    const [user] = await this.databaseService.db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) throw new NotFoundException("User not found");
    if (user.role !== "PARENT") throw new ConflictException("Linked user role must be PARENT");
  }

  private async ensureEmailAvailable(email: string, parentId?: string) {
    const where = parentId ? and(eq(parentsTable.email, email), ne(parentsTable.id, parentId)) : eq(parentsTable.email, email);
    const [existingParent] = await this.databaseService.db
      .select({ id: parentsTable.id })
      .from(parentsTable)
      .where(where)
      .limit(1);

    if (existingParent) throw new ConflictException("Parent email already exists");
  }

  private buildParentWhere(query: ParentListQueryDto): SQL | undefined {
    if (!query.search) return undefined;

    return or(ilike(parentsTable.name, `%${query.search}%`), ilike(parentsTable.email, `%${query.search}%`));
  }
}
