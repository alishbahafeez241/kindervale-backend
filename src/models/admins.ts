import cuid from "common/cuid";
import usersTable from "models/users";
import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

const adminsTable = pgTable("admins", {
  id: cuid().primaryKey(),
  userId: text()
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  phone: text(),
  designation: text().default("Admin").notNull(),
  permissions: jsonb().$type<string[]>().default([]).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull()
});

export default adminsTable;
export type Admin = typeof adminsTable.$inferSelect;
export type NewAdmin = typeof adminsTable.$inferInsert;
