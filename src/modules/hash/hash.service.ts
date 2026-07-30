import { Injectable } from "@nestjs/common";
import { genSalt, hash, compare } from "bcrypt";

@Injectable()
export class HashService {
  async hash(value: string): Promise<string> {
    const salt = await genSalt(10);
    return await hash(value, salt);
  }

  async compare(value: string, hash: string): Promise<boolean> {
    return await compare(value, hash);
  }
}
