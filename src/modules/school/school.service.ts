import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { ParamDto } from "common/common.dto";
import {
  calendarEventsTable,
  backupsTable,
  daycareReportsTable,
  daycareResourcesTable,
  documentsTable,
  examsTable,
  expensesTable,
  faqsTable,
  feesTable,
  leaveRequestsTable,
  notificationsTable,
  parentsTable,
  reportCardsTable,
  schoolPoliciesTable,
  settingsTable,
  studentsTable,
  timetablesTable
} from "models/school";
import teachersTable from "models/teachers";
import usersTable from "models/users";
import { DatabaseService } from "modules/database/database.service";
import {
  CreateCalendarEventDto,
  CreateBackupDto,
  CreateDaycareReportDto,
  CreateDaycareResourceDto,
  CreateDocumentDto,
  CreateExamDto,
  CreateExpenseDto,
  CreateFaqDto,
  CreateFeeDto,
  CreateLeaveRequestDto,
  CreateNotificationDto,
  CreateReportCardDto,
  CreateSchoolPolicyDto,
  CreateTimetableDto,
  ReviewLeaveRequestDto,
  UpdateCalendarEventDto,
  UpdateDaycareReportDto,
  UpdateDaycareResourceDto,
  UpdateDocumentDto,
  UpdateExamDto,
  UpdateExpenseDto,
  UpdateFaqDto,
  UpdateFeeDto,
  UpdateLeaveRequestDto,
  UpdateNotificationDto,
  UpdateReportCardDto,
  UpdateSchoolPolicyDto,
  UpdateTimetableDto,
  UpsertSettingsDto
} from "modules/school/school.dto";

type TableWithId = typeof parentsTable;

@Injectable()
export class SchoolService {
  constructor(private readonly databaseService: DatabaseService) {}

  async dashboard() {
    const [students, teachers, fees, notifications] = await Promise.all([
      this.getStudents(),
      this.databaseService.db.select().from(teachersTable),
      this.getFees(),
      this.getNotifications()
    ]);

    const pendingFees = fees.filter((fee) => fee.status !== "PAID").reduce((sum, fee) => sum + Number(fee.amount), 0);
    const attendance = students.length
      ? Math.round(students.reduce((sum, student) => sum + student.attendance, 0) / students.length)
      : 0;

    return {
      stats: {
        students: students.length,
        teachers: teachers.length,
        attendance,
        pendingFees
      },
      notifications
    };
  }

  getStudents() {
    return this.databaseService.db.select().from(studentsTable);
  }

  createFee(dto: CreateFeeDto) {
    return this.insert(feesTable, { ...dto, amount: dto.amount.toString() }, "fee");
  }

  getFees() {
    return this.databaseService.db.select().from(feesTable);
  }

  getFee(id: string) {
    return this.findOne(feesTable, id, "Fee");
  }

  updateFee(id: string, dto: UpdateFeeDto) {
    return this.update(feesTable, id, { ...dto, amount: dto.amount?.toString() }, "Fee");
  }

  deleteFee(id: string) {
    return this.delete(feesTable, id, "Fee");
  }

  createExam(dto: CreateExamDto) {
    return this.insert(examsTable, dto, "exam");
  }

  getExams() {
    return this.databaseService.db.select().from(examsTable);
  }

  getExam(id: string) {
    return this.findOne(examsTable, id, "Exam");
  }

  updateExam(id: string, dto: UpdateExamDto) {
    return this.update(examsTable, id, dto, "Exam");
  }

  deleteExam(id: string) {
    return this.delete(examsTable, id, "Exam");
  }

  createReportCard(dto: CreateReportCardDto, createdBy?: string) {
    return this.insert(reportCardsTable, { ...dto, createdBy }, "report card");
  }

  getReportCards() {
    return this.databaseService.db.select().from(reportCardsTable);
  }

  getReportCard(id: string) {
    return this.findOne(reportCardsTable, id, "Report card");
  }

  updateReportCard(id: string, dto: UpdateReportCardDto) {
    return this.update(reportCardsTable, id, dto, "Report card");
  }

  publishReportCard(id: string) {
    return this.update(reportCardsTable, id, { status: "APPROVED", publishedAt: new Date() }, "Report card");
  }

  deleteReportCard(id: string) {
    return this.delete(reportCardsTable, id, "Report card");
  }

  createCalendarEvent(dto: CreateCalendarEventDto) {
    return this.insert(calendarEventsTable, dto, "calendar event");
  }

  getCalendarEvents() {
    return this.databaseService.db.select().from(calendarEventsTable);
  }

  getCalendarEvent(id: string) {
    return this.findOne(calendarEventsTable, id, "Calendar event");
  }

  updateCalendarEvent(id: string, dto: UpdateCalendarEventDto) {
    return this.update(calendarEventsTable, id, dto, "Calendar event");
  }

  deleteCalendarEvent(id: string) {
    return this.delete(calendarEventsTable, id, "Calendar event");
  }

  createTimetable(dto: CreateTimetableDto) {
    return this.insert(timetablesTable, dto, "timetable");
  }

  getTimetables() {
    return this.databaseService.db.select().from(timetablesTable);
  }

  getTimetable(id: string) {
    return this.findOne(timetablesTable, id, "Timetable");
  }

  updateTimetable(id: string, dto: UpdateTimetableDto) {
    return this.update(timetablesTable, id, dto, "Timetable");
  }

  deleteTimetable(id: string) {
    return this.delete(timetablesTable, id, "Timetable");
  }

  createDocument(dto: CreateDocumentDto, uploadedBy?: string) {
    return this.insert(documentsTable, { ...dto, uploadedBy }, "document");
  }

  getDocuments() {
    return this.databaseService.db.select().from(documentsTable);
  }

  getDocument(id: string) {
    return this.findOne(documentsTable, id, "Document");
  }

  updateDocument(id: string, dto: UpdateDocumentDto) {
    return this.update(documentsTable, id, dto, "Document");
  }

  deleteDocument(id: string) {
    return this.delete(documentsTable, id, "Document");
  }

  createLeaveRequest(dto: CreateLeaveRequestDto) {
    return this.insert(leaveRequestsTable, dto, "leave request");
  }

  getLeaveRequests() {
    return this.databaseService.db
      .select({
        id: leaveRequestsTable.id,
        userId: leaveRequestsTable.userId,
        studentId: leaveRequestsTable.studentId,
        type: leaveRequestsTable.type,
        addedBy: leaveRequestsTable.addedBy,
        fromDate: leaveRequestsTable.fromDate,
        toDate: leaveRequestsTable.toDate,
        reason: leaveRequestsTable.reason,
        status: leaveRequestsTable.status,
        reviewRemarks: leaveRequestsTable.reviewRemarks,
        reviewedBy: leaveRequestsTable.reviewedBy,
        reviewedAt: leaveRequestsTable.reviewedAt,
        createdAt: leaveRequestsTable.createdAt,
        updatedAt: leaveRequestsTable.updatedAt,
        applicant: usersTable.name,
        applicantEmail: usersTable.email,
        studentName: studentsTable.name,
        className: studentsTable.className
      })
      .from(leaveRequestsTable)
      .leftJoin(usersTable, eq(leaveRequestsTable.userId, usersTable.id))
      .leftJoin(studentsTable, eq(leaveRequestsTable.studentId, studentsTable.id));
  }

  getLeaveRequest(id: string) {
    return this.findOne(leaveRequestsTable, id, "Leave request");
  }

  updateLeaveRequest(id: string, dto: UpdateLeaveRequestDto) {
    return this.update(leaveRequestsTable, id, dto, "Leave request");
  }

  reviewLeaveRequest(id: string, dto: ReviewLeaveRequestDto, reviewedBy?: string) {
    return this.update(leaveRequestsTable, id, { ...dto, reviewedBy, reviewedAt: new Date() }, "Leave request");
  }

  deleteLeaveRequest(id: string) {
    return this.delete(leaveRequestsTable, id, "Leave request");
  }

  createExpense(dto: CreateExpenseDto, createdBy?: string) {
    return this.insert(expensesTable, { ...dto, amount: dto.amount.toString(), createdBy }, "expense");
  }

  getExpenses() {
    return this.databaseService.db.select().from(expensesTable);
  }

  getExpense(id: string) {
    return this.findOne(expensesTable, id, "Expense");
  }

  updateExpense(id: string, dto: UpdateExpenseDto) {
    return this.update(expensesTable, id, { ...dto, amount: dto.amount?.toString() }, "Expense");
  }

  deleteExpense(id: string) {
    return this.delete(expensesTable, id, "Expense");
  }

  createFaq(dto: CreateFaqDto) {
    return this.insert(faqsTable, dto, "FAQ");
  }

  getFaqs() {
    return this.databaseService.db.select().from(faqsTable);
  }

  getFaq(id: string) {
    return this.findOne(faqsTable, id, "FAQ");
  }

  updateFaq(id: string, dto: UpdateFaqDto) {
    return this.update(faqsTable, id, dto, "FAQ");
  }

  deleteFaq(id: string) {
    return this.delete(faqsTable, id, "FAQ");
  }

  createSchoolPolicy(dto: CreateSchoolPolicyDto) {
    return this.insert(schoolPoliciesTable, { ...dto, publishedAt: new Date() }, "school policy");
  }

  getSchoolPolicies() {
    return this.databaseService.db.select().from(schoolPoliciesTable);
  }

  getSchoolPolicy(id: string) {
    return this.findOne(schoolPoliciesTable, id, "School policy");
  }

  updateSchoolPolicy(id: string, dto: UpdateSchoolPolicyDto) {
    return this.update(schoolPoliciesTable, id, dto, "School policy");
  }

  deleteSchoolPolicy(id: string) {
    return this.delete(schoolPoliciesTable, id, "School policy");
  }

  createDaycareReport(dto: CreateDaycareReportDto, createdBy?: string) {
    return this.insert(daycareReportsTable, { ...dto, createdBy }, "daycare report");
  }

  getDaycareReports() {
    return this.databaseService.db.select().from(daycareReportsTable);
  }

  getDaycareReport(id: string) {
    return this.findOne(daycareReportsTable, id, "Daycare report");
  }

  updateDaycareReport(id: string, dto: UpdateDaycareReportDto) {
    return this.update(daycareReportsTable, id, dto, "Daycare report");
  }

  deleteDaycareReport(id: string) {
    return this.delete(daycareReportsTable, id, "Daycare report");
  }

  createDaycareResource(dto: CreateDaycareResourceDto, createdBy?: string) {
    return this.insert(daycareResourcesTable, { ...dto, createdBy }, "daycare resource");
  }

  getDaycareResources() {
    return this.databaseService.db.select().from(daycareResourcesTable);
  }

  getDaycareResource(id: string) {
    return this.findOne(daycareResourcesTable, id, "Daycare resource");
  }

  updateDaycareResource(id: string, dto: UpdateDaycareResourceDto) {
    return this.update(daycareResourcesTable, id, dto, "Daycare resource");
  }

  deleteDaycareResource(id: string) {
    return this.delete(daycareResourcesTable, id, "Daycare resource");
  }

  createBackup(dto: CreateBackupDto, requestedBy?: string) {
    return this.insert(backupsTable, { ...dto, requestedBy }, "backup request");
  }

  getBackups() {
    return this.databaseService.db.select().from(backupsTable);
  }

  getBackup(id: string) {
    return this.findOne(backupsTable, id, "Backup");
  }

  createNotification(dto: CreateNotificationDto) {
    return this.insert(notificationsTable, dto, "notification");
  }

  getNotifications() {
    return this.databaseService.db.select().from(notificationsTable);
  }

  getNotification(id: string) {
    return this.findOne(notificationsTable, id, "Notification");
  }

  updateNotification(id: string, dto: UpdateNotificationDto) {
    return this.update(notificationsTable, id, dto, "Notification");
  }

  deleteNotification(id: string) {
    return this.delete(notificationsTable, id, "Notification");
  }

  async getSettings() {
    const [settings] = await this.databaseService.db.select().from(settingsTable).limit(1);
    return settings ?? null;
  }

  async upsertSettings(dto: UpsertSettingsDto) {
    const [settings] = await this.databaseService.db.select({ id: settingsTable.id }).from(settingsTable).limit(1);
    if (!settings) return this.insert(settingsTable, dto, "settings");
    return this.update(settingsTable, settings.id, dto, "Settings");
  }

  private async insert(table: any, dto: object, label: string) {
    const records = (await this.databaseService.db.insert(table).values(dto).returning()) as unknown[];
    const [record] = records;
    if (!record) throw new ConflictException(`Failed to create ${label}`);
    return record;
  }

  private async findOne(table: TableWithId | any, id: ParamDto["id"], label: string) {
    const [record] = await this.databaseService.db.select().from(table).where(eq(table.id, id)).limit(1);
    if (!record) throw new NotFoundException(`${label} not found`);
    return record;
  }

  private async update(table: TableWithId | any, id: string, dto: object, label: string) {
    const [record] = await this.databaseService.db
      .update(table)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(table.id, id))
      .returning();
    if (!record) throw new NotFoundException(`${label} not found`);
    return record;
  }

  private async delete(table: TableWithId | any, id: string, label: string) {
    const result = await this.databaseService.db.delete(table).where(eq(table.id, id)).returning({ id: table.id });
    if (!result.length) throw new NotFoundException(`${label} not found`);
    return { deleted: true };
  }
}
