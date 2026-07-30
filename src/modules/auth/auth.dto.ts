import { IsEmail, IsIn, IsOptional, IsString, Length, MinLength } from "class-validator";
import { Trim } from "common/transformer";

export const portalRoles = ["admin", "principal", "teacher", "parent", "student"] as const;
export type PortalRole = (typeof portalRoles)[number];

export class LoginDto {
  @IsEmail({}, { message: "Email must be valid" })
  @Trim()
  email: string;

  @IsString({ message: "Password must be a string" })
  @MinLength(6, { message: "Password must be at least 6 characters" })
  password: string;

  @IsIn(portalRoles, { message: `Role must be one of: ${portalRoles.join(", ")}` })
  role: PortalRole;
}

export class RefreshTokenDto {
  @IsString({ message: "Refresh token must be a string" })
  refreshToken: string;
}

export class LogoutDto {
  @IsOptional()
  @IsString({ message: "Refresh token must be a string" })
  refreshToken?: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: "Email must be valid" })
  @Trim()
  email: string;
}

export class ResetPasswordDto {
  @IsEmail({}, { message: "Email must be valid" })
  @Trim()
  email: string;

  @IsString({ message: "OTP must be a string" })
  @Length(6, 6, { message: "OTP must be 6 digits" })
  otp: string;

  @IsString({ message: "Password must be a string" })
  @MinLength(6, { message: "Password must be at least 6 characters" })
  newPassword: string;
}

export class ChangePasswordDto {
  @IsString({ message: "Current password must be a string" })
  currentPassword: string;

  @IsString({ message: "New password must be a string" })
  @MinLength(6, { message: "New password must be at least 6 characters" })
  newPassword: string;
}
