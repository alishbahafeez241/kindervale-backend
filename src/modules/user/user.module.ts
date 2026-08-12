import { Module } from "@nestjs/common";
import { HashModule } from "modules/hash/hash.module";
import { UserController } from "modules/user/user.controller";
import { UserService } from "modules/user/user.service";

@Module({
  imports: [HashModule],
  providers: [UserService],
  controllers: [UserController]
})
export class UserModule {}
