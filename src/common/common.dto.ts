import { IsNotEmpty, IsString } from "class-validator";
import { Trim } from "common/transformer";

export class ParamDto {
  @IsNotEmpty({ message: "ID is required" })
  @IsString({ message: "ID must be a string" })
  @Trim()
  id: string;
}
