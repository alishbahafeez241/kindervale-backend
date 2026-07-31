import "dotenv/config";
import { createId } from "@paralleldrive/cuid2";
import { hash } from "bcrypt";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import adminsTable from "models/admins";
import usersTable from "models/users";

const email = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
const password = process.env.SEED_ADMIN_PASSWORD ?? "password123";
const name = process.env.SEED_ADMIN_NAME ?? "Admin User";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { casing: "snake_case" });

  try {
    const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    const passwordHash = await hash(password, 10);

    const [user] = existingUser
      ? await db
          .update(usersTable)
          .set({
            name,
            password: passwordHash,
            role: "ADMIN",
            status: "ACTIVE",
            updatedAt: new Date()
          })
          .where(eq(usersTable.id, existingUser.id))
          .returning()
      : await db
          .insert(usersTable)
          .values({
            id: createId(),
            name,
            email,
            password: passwordHash,
            role: "ADMIN",
            status: "ACTIVE"
          })
          .returning();

    const [existingAdmin] = await db.select().from(adminsTable).where(eq(adminsTable.userId, user.id)).limit(1);
    if (existingAdmin) {
      await db
        .update(adminsTable)
        .set({ designation: "Admin", updatedAt: new Date() })
        .where(eq(adminsTable.id, existingAdmin.id));
    } else {
      await db.insert(adminsTable).values({
        id: createId(),
        userId: user.id,
        designation: "Admin"
      });
    }

    console.log(`Seeded admin login: ${email} / ${password}`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
