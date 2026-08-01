import { IsEmail, IsIn, IsOptional, IsString, Length, MinLength, ValidateIf } from "class-validator";
import { Trim } from "common/transformer";

export const portalRoles = ["admin", "daycareadmin", "principal", "teacher", "parent"] as const;
export type PortalRole = (typeof portalRoles)[number];

export class LoginDto {
  @ValidateIf((dto: LoginDto) => !dto.username)
  @IsEmail({}, { message: "Email must be valid" })
  @Trim()
  email?: string;

  @ValidateIf((dto: LoginDto) => !dto.email)
  @IsString({ message: "Username must be a string" })
  @Trim()
  username?: string;

  @IsString({ message: "Password must be a string" })
  @MinLength(6, { message: "Password must be at least 6 characters" })
  password: string;

  @IsString({ message: "OTP must be a string" })
  @Length(4, 6, { message: "OTP must be 4 to 6 digits" })
  otp: string;

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
