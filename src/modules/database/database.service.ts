import { Injectable, OnApplicationBootstrap, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

@Injectable()
export class DatabaseService implements OnApplicationBootstrap, OnModuleDestroy {
  private pool: Pool;
  public db: ReturnType<typeof drizzle>;

  constructor(private readonly configService: ConfigService) {}

  onApplicationBootstrap() {
    const connectionString: string = this.configService.getOrThrow<string>("DATABASE_URL");

    this.pool = new Pool({
      connectionString
    });

    this.db = drizzle(this.pool, { casing: "snake_case" });
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
    }
  }
}
