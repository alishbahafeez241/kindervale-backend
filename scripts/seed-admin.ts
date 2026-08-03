import "dotenv/config";
import { createId } from "@paralleldrive/cuid2";
import { hash } from "bcrypt";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import adminsTable from "models/admins";
import usersTable from "models/users";

const seedUsers = [
  {
    email: process.env.SEED_ADMIN_EMAIL ?? "admin@example.com",
    password: process.env.SEED_ADMIN_PASSWORD ?? "password123",
    name: process.env.SEED_ADMIN_NAME ?? "Admin User",
    role: "ADMIN",
    designation: "Admin"
  },
  {
    email: process.env.SEED_DAYCARE_ADMIN_EMAIL ?? "daycareadmin@example.com",
    password: process.env.SEED_DAYCARE_ADMIN_PASSWORD ?? "demo123",
    name: process.env.SEED_DAYCARE_ADMIN_NAME ?? "Daycare Admin",
    role: "DAYCAREADMIN",
    designation: "Daycare Admin"
  }
] as const;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { casing: "snake_case" });

  try {
    for (const seedUser of seedUsers) {
      const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, seedUser.email)).limit(1);
      const passwordHash = await hash(seedUser.password, 10);

      const [user] = existingUser
        ? await db
            .update(usersTable)
            .set({
              name: seedUser.name,
              password: passwordHash,
              role: seedUser.role,
              status: "ACTIVE",
              updatedAt: new Date()
            })
            .where(eq(usersTable.id, existingUser.id))
            .returning()
        : await db
            .insert(usersTable)
            .values({
              id: createId(),
              name: seedUser.name,
              email: seedUser.email,
              password: passwordHash,
              role: seedUser.role,
              status: "ACTIVE"
            })
            .returning();

      const [existingAdmin] = await db.select().from(adminsTable).where(eq(adminsTable.userId, user.id)).limit(1);
      if (existingAdmin) {
        await db
          .update(adminsTable)
          .set({ designation: seedUser.designation, updatedAt: new Date() })
          .where(eq(adminsTable.id, existingAdmin.id));
      } else {
        await db.insert(adminsTable).values({
          id: createId(),
          userId: user.id,
          designation: seedUser.designation
        });
      }

      console.log(`Seeded ${seedUser.role} login: ${seedUser.email} / ${seedUser.password}`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
