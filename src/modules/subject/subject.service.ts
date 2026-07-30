import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { and, asc, count, desc, eq, ilike, ne, or, type SQL } from "drizzle-orm";
import { classesTable, subjectsTable, type Subject } from "models/school";
import usersTable from "models/users";
import { DatabaseService } from "modules/database/database.service";
import type { CreateSubjectDto, SubjectListQueryDto, UpdateSubjectDto } from "modules/subject/subject.dto";

@Injectable()
export class SubjectService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createSubject(dto: CreateSubjectDto): Promise<Subject> {
    await this.validateRelations(dto.classId, dto.teacherId);
    await this.ensureNameAvailable(dto.name);
    if (dto.code) await this.ensureCodeAvailable(dto.code);

    const [subject] = await this.databaseService.db.insert(subjectsTable).values(dto).returning();
    if (!subject) throw new ConflictException("Failed to create subject");
    return subject;
  }

  async getSubjects(query: SubjectListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;
    const where = this.buildSubjectWhere(query);
    const sortColumn = subjectsTable[query.sortBy ?? "createdAt"];
    const orderBy = query.sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

    const [items, [{ total }]] = await Promise.all([
      this.databaseService.db.select().from(subjectsTable).where(where).orderBy(orderBy).limit(limit).offset(offset),
      this.databaseService.db.select({ total: count() }).from(subjectsTable).where(where)
    ]);

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  async getSubject(id: string): Promise<Subject> {
    const [subject] = await this.databaseService.db.select().from(subjectsTable).where(eq(subjectsTable.id, id)).limit(1);
    if (!subject) throw new NotFoundException("Subject not found");
    return subject;
  }

  async updateSubject(id: string, dto: UpdateSubjectDto): Promise<Subject> {
    await this.validateRelations(dto.classId, dto.teacherId);
    if (dto.name) await this.ensureNameAvailable(dto.name, id);
    if (dto.code) await this.ensureCodeAvailable(dto.code, id);

    const [subject] = await this.databaseService.db
      .update(subjectsTable)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(subjectsTable.id, id))
      .returning();

    if (!subject) throw new NotFoundException("Subject not found");
    return subject;
  }

  async deleteSubject(id: string): Promise<void> {
    const [subject] = await this.databaseService.db
      .delete(subjectsTable)
      .where(eq(subjectsTable.id, id))
      .returning({ id: subjectsTable.id });

    if (!subject) throw new NotFoundException("Subject not found");
  }

  private async validateRelations(classId?: string, teacherId?: string) {
    if (classId) {
      const [classRoom] = await this.databaseService.db.select({ id: classesTable.id }).from(classesTable).where(eq(classesTable.id, classId)).limit(1);
      if (!classRoom) throw new NotFoundException("Class not found");
    }

    if (teacherId) {
      const [teacher] = await this.databaseService.db.select().from(usersTable).where(eq(usersTable.id, teacherId)).limit(1);
      if (!teacher) throw new NotFoundException("Teacher user not found");
      if (teacher.role !== "TEACHER") throw new ConflictException("Teacher user role must be TEACHER");
    }
  }

  private async ensureNameAvailable(name: string, subjectId?: string) {
    const where = subjectId ? and(eq(subjectsTable.name, name), ne(subjectsTable.id, subjectId)) : eq(subjectsTable.name, name);
    const [subject] = await this.databaseService.db.select({ id: subjectsTable.id }).from(subjectsTable).where(where).limit(1);
    if (subject) throw new ConflictException("Subject name already exists");
  }

  private async ensureCodeAvailable(code: string, subjectId?: string) {
    const where = subjectId ? and(eq(subjectsTable.code, code), ne(subjectsTable.id, subjectId)) : eq(subjectsTable.code, code);
    const [subject] = await this.databaseService.db.select({ id: subjectsTable.id }).from(subjectsTable).where(where).limit(1);
    if (subject) throw new ConflictException("Subject code already exists");
  }

  private buildSubjectWhere(query: SubjectListQueryDto): SQL | undefined {
    const conditions: SQL[] = [];
    if (query.classId) conditions.push(eq(subjectsTable.classId, query.classId));
    if (query.teacherId) conditions.push(eq(subjectsTable.teacherId, query.teacherId));
    if (query.search) {
      const searchCondition = or(ilike(subjectsTable.name, `%${query.search}%`), ilike(subjectsTable.code, `%${query.search}%`));
      if (searchCondition) conditions.push(searchCondition);
    }
    return conditions.length ? and(...conditions) : undefined;
  }
}
