import { randomInt } from "node:crypto";
import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { passwordResetTokensTable, refreshTokensTable } from "models/auth";
import adminsTable from "models/admins";
import { parentsTable, studentsTable } from "models/school";
import teachersTable from "models/teachers";
import usersTable, { type SafeUser, type UserRole } from "models/users";
import { DatabaseService } from "modules/database/database.service";
import { HashService } from "modules/hash/hash.service";
import { JWTService } from "modules/jwt/jwt.service";
import { MailService } from "modules/mail/mail.service";
import type {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  LogoutDto,
  PortalRole,
  RefreshTokenDto,
  ResetPasswordDto
} from "modules/auth/auth.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly hashService: HashService,
    private readonly jwtService: JWTService,
    private readonly mailService: MailService
  ) {}

  async login(dto: LoginDto) {
    const role = dto.role.toUpperCase() as UserRole;
    const [user] = await this.databaseService.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, dto.email))
      .limit(1);

    if (!user || user.role !== role || user.status !== "ACTIVE") {
      throw new UnauthorizedException("Invalid email, password, or role.");
    }

    const isPasswordValid = await this.hashService.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email, password, or role.");
    }

    const tokenPayload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: dto.role
    };
    const accessToken = this.jwtService.generateAccessToken(tokenPayload);
    const refreshToken = this.jwtService.generateRefreshToken(tokenPayload);
    await this.persistRefreshToken(user.id, refreshToken);

    const portalUser = await this.toPortalUser(user.id, user.name, user.email, dto.role);

    return {
      message: "Authenticated",
      data: {
        ...portalUser,
        accessToken,
        refreshToken
      }
    };
  }

  async refresh(dto: RefreshTokenDto) {
    const payload = this.jwtService.verifyToken(dto.refreshToken).data as {
      userId: string;
      name: string;
      email: string;
      role: PortalRole;
    };

    if (!payload?.userId) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const refreshRecord = await this.findValidRefreshToken(payload.userId, dto.refreshToken);
    if (!refreshRecord) {
      throw new UnauthorizedException("Refresh token has been revoked or expired");
    }

    const [user] = await this.databaseService.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, payload.userId))
      .limit(1);

    if (!user || user.status !== "ACTIVE") {
      throw new UnauthorizedException("User is inactive or no longer exists");
    }

    await this.databaseService.db
      .update(refreshTokensTable)
      .set({ revokedAt: new Date(), updatedAt: new Date() })
      .where(eq(refreshTokensTable.id, refreshRecord.id));

    const tokenPayload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase() as PortalRole
    };
    const accessToken = this.jwtService.generateAccessToken(tokenPayload);
    const refreshToken = this.jwtService.generateRefreshToken(tokenPayload);
    await this.persistRefreshToken(user.id, refreshToken);

    return {
      message: "Token refreshed successfully",
      data: { accessToken, refreshToken }
    };
  }

  async logout(dto: LogoutDto) {
    if (dto.refreshToken) {
      const payload = this.jwtService.verifyToken(dto.refreshToken).data as { userId?: string };
      if (payload?.userId) {
        const refreshRecord = await this.findValidRefreshToken(payload.userId, dto.refreshToken);
        if (refreshRecord) {
          await this.databaseService.db
            .update(refreshTokensTable)
            .set({ revokedAt: new Date(), updatedAt: new Date() })
            .where(eq(refreshTokensTable.id, refreshRecord.id));
        }
      }
    }

    return { message: "Logged out successfully" };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const [user] = await this.databaseService.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, dto.email))
      .limit(1);

    if (user?.status === "ACTIVE") {
      const otp = randomInt(100000, 1000000).toString();
      await this.databaseService.db.insert(passwordResetTokensTable).values({
        userId: user.id,
        otpHash: await this.hashService.hash(otp),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      });
      await this.mailService.sendResetEmail(user.email, user.name, otp);
    }

    return {
      message: "If the email exists, a password reset OTP has been sent"
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const [user] = await this.databaseService.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, dto.email))
      .limit(1);

    if (!user || user.status !== "ACTIVE") {
      throw new UnauthorizedException("Invalid or expired reset OTP");
    }

    const resetTokens = await this.databaseService.db
      .select()
      .from(passwordResetTokensTable)
      .where(
        and(
          eq(passwordResetTokensTable.userId, user.id),
          isNull(passwordResetTokensTable.usedAt),
          gt(passwordResetTokensTable.expiresAt, new Date())
        )
      )
      .orderBy(desc(passwordResetTokensTable.createdAt));

    const token = await this.findMatchingResetToken(resetTokens, dto.otp);
    if (!token) {
      throw new UnauthorizedException("Invalid or expired reset OTP");
    }

    await this.databaseService.db
      .update(usersTable)
      .set({ password: await this.hashService.hash(dto.newPassword), updatedAt: new Date() })
      .where(eq(usersTable.id, user.id));

    await this.databaseService.db
      .update(passwordResetTokensTable)
      .set({ usedAt: new Date(), updatedAt: new Date() })
      .where(eq(passwordResetTokensTable.id, token.id));

    await this.revokeAllRefreshTokens(user.id);

    return { message: "Password reset successfully" };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const [user] = await this.databaseService.db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user || user.status !== "ACTIVE") {
      throw new UnauthorizedException("User is inactive or no longer exists");
    }

    const isPasswordValid = await this.hashService.compare(dto.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    await this.databaseService.db
      .update(usersTable)
      .set({ password: await this.hashService.hash(dto.newPassword), updatedAt: new Date() })
      .where(eq(usersTable.id, user.id));

    await this.revokeAllRefreshTokens(user.id);

    return { message: "Password changed successfully" };
  }

  async profile(userId: string) {
    const [user] = await this.databaseService.db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role,
        status: usersTable.status,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const portalUser = await this.toPortalUser(user.id, user.name, user.email, user.role.toLowerCase() as PortalRole);
    return {
      data: {
        ...(user as SafeUser),
        ...portalUser
      }
    };
  }

  private async persistRefreshToken(userId: string, refreshToken: string) {
    await this.databaseService.db.insert(refreshTokensTable).values({
      userId,
      tokenHash: await this.hashService.hash(refreshToken),
      expiresAt: new Date(Date.now() + this.jwtService.refreshTokenMaxAge)
    });
  }

  private async findValidRefreshToken(userId: string, refreshToken: string) {
    const records = await this.databaseService.db
      .select()
      .from(refreshTokensTable)
      .where(
        and(
          eq(refreshTokensTable.userId, userId),
          isNull(refreshTokensTable.revokedAt),
          gt(refreshTokensTable.expiresAt, new Date())
        )
      )
      .orderBy(desc(refreshTokensTable.createdAt));

    for (const record of records) {
      if (await this.hashService.compare(refreshToken, record.tokenHash)) {
        return record;
      }
    }

    return null;
  }

  private async findMatchingResetToken(tokens: (typeof passwordResetTokensTable.$inferSelect)[], otp: string) {
    for (const token of tokens) {
      if (await this.hashService.compare(otp, token.otpHash)) {
        return token;
      }
    }

    return null;
  }

  private async revokeAllRefreshTokens(userId: string) {
    await this.databaseService.db
      .update(refreshTokensTable)
      .set({ revokedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(refreshTokensTable.userId, userId), isNull(refreshTokensTable.revokedAt)));
  }

  private async toPortalUser(id: string, name: string, email: string, role: PortalRole) {
    if (role === "teacher") {
      const [teacher] = await this.databaseService.db
        .select()
        .from(teachersTable)
        .where(eq(teachersTable.userId, id))
        .limit(1);

      return {
        id,
        name,
        email,
        role,
        homeroom: teacher?.className
      };
    }

    if (role === "parent") {
      const [parent] = await this.databaseService.db
        .select()
        .from(parentsTable)
        .where(eq(parentsTable.userId, id))
        .limit(1);

      const linkedStudents = parent
        ? await this.databaseService.db
            .select({ id: studentsTable.id })
            .from(studentsTable)
            .where(eq(studentsTable.parentId, parent.id))
        : [];

      return {
        id,
        name,
        email,
        role,
        linkedStudentIds: linkedStudents.map((student) => student.id)
      };
    }

    if (role === "student") {
      const [student] = await this.databaseService.db
        .select({ id: studentsTable.id })
        .from(studentsTable)
        .where(eq(studentsTable.userId, id))
        .limit(1);

      return {
        id,
        name,
        email,
        role,
        linkedStudentIds: student ? [student.id] : []
      };
    }

    const [admin] = await this.databaseService.db.select().from(adminsTable).where(eq(adminsTable.userId, id)).limit(1);

    return {
      id,
      name,
      email,
      role,
      designation: role === "principal" ? "Principal" : admin?.designation
    };
  }
}
