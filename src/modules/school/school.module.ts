import { Module } from "@nestjs/common";
import { SchoolController } from "modules/school/school.controller";
import { SchoolService } from "modules/school/school.service";

@Module({
  controllers: [SchoolController],
  providers: [SchoolService]
})
export class SchoolModule {}
