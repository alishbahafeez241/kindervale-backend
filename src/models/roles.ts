import cuid from "common/cuid";
import { userRoleEnum } from "models/users";
import { boolean, index, pgEnum, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

export const permissionActionEnum = pgEnum("permission_action", ["CREATE", "READ", "UPDATE", "DELETE", "MANAGE"]);
export type PermissionAction = (typeof permissionActionEnum.enumValues)[number];

export const rolesTable = pgTable("roles", {
  id: cuid().primaryKey(),
  name: userRoleEnum().notNull().unique(),
  description: text(),
  isSystem: boolean().default(true).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull()
});

export const permissionsTable = pgTable(
  "permissions",
  {
    id: cuid().primaryKey(),
    module: text().notNull(),
    action: permissionActionEnum().notNull(),
    description: text(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull()
  },
  (table) => [unique("permissions_module_action_unique").on(table.module, table.action), index("permissions_module_idx").on(table.module)]
);

export const rolePermissionsTable = pgTable(
  "role_permissions",
  {
    id: cuid().primaryKey(),
    roleId: text()
      .notNull()
      .references(() => rolesTable.id, { onDelete: "cascade" }),
    permissionId: text()
      .notNull()
      .references(() => permissionsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull()
  },
  (table) => [unique("role_permissions_role_permission_unique").on(table.roleId, table.permissionId)]
);

export type Role = typeof rolesTable.$inferSelect;
export type Permission = typeof permissionsTable.$inferSelect;
export type RolePermission = typeof rolePermissionsTable.$inferSelect;
