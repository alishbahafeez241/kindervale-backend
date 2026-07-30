import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { and, asc, count, desc, eq, getTableColumns, ilike, ne, or, type SQL } from "drizzle-orm";
import usersTable, { type SafeUser } from "models/users";
import { DatabaseService } from "modules/database/database.service";
import { HashService } from "modules/hash/hash.service";
import type { CreateUserDto, UpdateUserDto, UserListQueryDto } from "modules/user/user.dto";

@Injectable()
export class UserService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly hashService: HashService
  ) {}

  async createUser(dto: CreateUserDto): Promise<SafeUser> {
    const { password: _, ...safeColumns } = getTableColumns(usersTable);

    const [existingUser] = await this.databaseService.db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, dto.email))
      .limit(1);

    if (existingUser) {
      throw new ConflictException("Email already exists");
    }

    const [user] = await this.databaseService.db
      .insert(usersTable)
      .values({
        ...dto,
        password: await this.hashService.hash(dto.password)
      })
      .returning(safeColumns);

    if (!user) {
      throw new ConflictException("Failed to create user");
    }

    return user as SafeUser;
  }

  async getUsers(query: UserListQueryDto) {
    const { password: _, ...safeColumns } = getTableColumns(usersTable);
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;
    const where = this.buildUserWhere(query);
    const sortColumn = usersTable[query.sortBy ?? "createdAt"];
    const orderBy = query.sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

    const [users, [{ total }]] = await Promise.all([
      this.databaseService.db.select(safeColumns).from(usersTable).where(where).orderBy(orderBy).limit(limit).offset(offset),
      this.databaseService.db.select({ total: count() }).from(usersTable).where(where)
    ]);

    return {
      items: users as SafeUser[],
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getUser(userId: string): Promise<SafeUser> {
    const { password: _, ...safeColumns } = getTableColumns(usersTable);

    const [user] = await this.databaseService.db
      .select(safeColumns)
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user as SafeUser;
  }

  async updateUser(userId: string, dto: UpdateUserDto): Promise<SafeUser> {
    const { password: _, ...safeColumns } = getTableColumns(usersTable);
    if (dto.email) {
      const [existingUser] = await this.databaseService.db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(and(eq(usersTable.email, dto.email), ne(usersTable.id, userId)))
        .limit(1);

      if (existingUser) {
        throw new ConflictException("Email already exists");
      }
    }

    const updateData = {
      ...dto,
      updatedAt: new Date()
    };

    if (dto.password) {
      updateData.password = await this.hashService.hash(dto.password);
    }

    const [user] = await this.databaseService.db
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, userId))
      .returning(safeColumns);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user as SafeUser;
  }

  async deleteUser(userId: string): Promise<void> {
    const [deletedUser] = await this.databaseService.db
      .delete(usersTable)
      .where(eq(usersTable.id, userId))
      .returning({ id: usersTable.id });

    if (!deletedUser) {
      throw new NotFoundException("User not found");
    }
  }

  private buildUserWhere(query: UserListQueryDto): SQL | undefined {
    const conditions: SQL[] = [];

    if (query.role) conditions.push(eq(usersTable.role, query.role));
    if (query.status) conditions.push(eq(usersTable.status, query.status));
    if (query.search) {
      const searchCondition = or(ilike(usersTable.name, `%${query.search}%`), ilike(usersTable.email, `%${query.search}%`));
      if (searchCondition) conditions.push(searchCondition);
    }

    return conditions.length ? and(...conditions) : undefined;
  }
}
