import "dotenv/config";
import { createId } from "@paralleldrive/cuid2";
import { hash } from "bcrypt";
import { eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import adminsTable from "models/admins";
import { parentsTable } from "models/school";
import teachersTable from "models/teachers";
import usersTable from "models/users";

const seedUsers = [
  {
    email: process.env.SEED_ADMIN_EMAIL ?? "admin@example.com",
    username: process.env.SEED_ADMIN_USERNAME ?? "admin",
    password: process.env.SEED_ADMIN_PASSWORD ?? "demo123",
    name: process.env.SEED_ADMIN_NAME ?? "Admin User",
    role: "ADMIN",
    designation: "Admin"
  },
  {
    email: process.env.SEED_DAYCARE_ADMIN_EMAIL ?? "daycareadmin@example.com",
    username: process.env.SEED_DAYCARE_ADMIN_USERNAME ?? "daycareadmin",
    password: process.env.SEED_DAYCARE_ADMIN_PASSWORD ?? "demo123",
    name: process.env.SEED_DAYCARE_ADMIN_NAME ?? "Daycare Admin",
    role: "DAYCAREADMIN",
    designation: "Daycare Admin"
  },
  {
    email: process.env.SEED_PRINCIPAL_EMAIL ?? "principal@example.com",
    username: process.env.SEED_PRINCIPAL_USERNAME ?? "principal",
    password: process.env.SEED_PRINCIPAL_PASSWORD ?? "demo123",
    name: process.env.SEED_PRINCIPAL_NAME ?? "Principal User",
    role: "PRINCIPAL",
    designation: "Principal"
  },
  {
    email: process.env.SEED_TEACHER_EMAIL ?? "teacher@example.com",
    username: process.env.SEED_TEACHER_USERNAME ?? "teacher",
    password: process.env.SEED_TEACHER_PASSWORD ?? "demo123",
    name: process.env.SEED_TEACHER_NAME ?? "Teacher User",
    role: "TEACHER",
    subject: "General",
    className: "Kindergarten"
  },
  {
    email: process.env.SEED_PARENT_EMAIL ?? "parent@example.com",
    username: process.env.SEED_PARENT_USERNAME ?? "parent",
    password: process.env.SEED_PARENT_PASSWORD ?? "demo123",
    name: process.env.SEED_PARENT_NAME ?? "Parent User",
    role: "PARENT",
    phone: "0000000000"
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
      const [existingUser] = await db
        .select()
        .from(usersTable)
        .where(or(eq(usersTable.email, seedUser.email), eq(usersTable.username, seedUser.username)))
        .limit(1);
      const passwordHash = await hash(seedUser.password, 10);

      const [user] = existingUser
        ? await db
            .update(usersTable)
            .set({
              name: seedUser.name,
              username: seedUser.username,
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
              username: seedUser.username,
              email: seedUser.email,
              password: passwordHash,
              role: seedUser.role,
              status: "ACTIVE"
            })
            .returning();

      if (seedUser.role === "ADMIN" || seedUser.role === "DAYCAREADMIN" || seedUser.role === "PRINCIPAL") {
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
      }

      if (seedUser.role === "TEACHER") {
        const [existingTeacher] = await db.select().from(teachersTable).where(eq(teachersTable.userId, user.id)).limit(1);
        if (existingTeacher) {
          await db
            .update(teachersTable)
            .set({ subject: seedUser.subject, className: seedUser.className, updatedAt: new Date() })
            .where(eq(teachersTable.id, existingTeacher.id));
        } else {
          await db.insert(teachersTable).values({
            id: createId(),
            userId: user.id,
            subject: seedUser.subject,
            className: seedUser.className
          });
        }
      }

      if (seedUser.role === "PARENT") {
        const [existingParent] = await db.select().from(parentsTable).where(eq(parentsTable.userId, user.id)).limit(1);
        if (existingParent) {
          await db
            .update(parentsTable)
            .set({ name: seedUser.name, email: seedUser.email, phone: seedUser.phone, updatedAt: new Date() })
            .where(eq(parentsTable.id, existingParent.id));
        } else {
          await db.insert(parentsTable).values({
            id: createId(),
            userId: user.id,
            name: seedUser.name,
            email: seedUser.email,
            phone: seedUser.phone
          });
        }
      }

      console.log(`Seeded ${seedUser.role} login: ${seedUser.username} / ${seedUser.password} / OTP 0000`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
