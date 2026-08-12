import { Module } from "@nestjs/common";
import { AuthController } from "modules/auth/auth.controller";
import { AuthService } from "modules/auth/auth.service";
import { HashModule } from "modules/hash/hash.module";
import { JWTModule } from "modules/jwt/jwt.module";
import { MailModule } from "modules/mail/mail.module";

@Module({
  imports: [HashModule, JWTModule, MailModule],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
