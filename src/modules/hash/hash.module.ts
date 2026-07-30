import { Module } from "@nestjs/common";
import { HashService } from "modules/hash/hash.service";

@Module({
  providers: [HashService],
  exports: [HashService]
})
export class HashModule {}
