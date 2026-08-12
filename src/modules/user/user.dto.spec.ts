import { normalizePortalRole, normalizeUserRole } from "../../common/role-normalizer";

describe("role normalization", () => {
  it.each([
    ["admin", "ADMIN"],
    ["ADMIN", "ADMIN"],
    ["Admin", "ADMIN"],
    ["teacher", "TEACHER"],
    ["TEACHER", "TEACHER"],
    ["Teacher", "TEACHER"],
    ["parent", "PARENT"],
    ["PARENT", "PARENT"],
    ["Parent", "PARENT"],
    ["principal", "PRINCIPAL"],
    ["PRINCIPAL", "PRINCIPAL"],
    ["Principal", "PRINCIPAL"],
    ["daycareadmin", "DAYCAREADMIN"],
    ["DAYCAREADMIN", "DAYCAREADMIN"],
    ["DaycareAdmin", "DAYCAREADMIN"],
    ["daycareAdmin", "DAYCAREADMIN"],
    ["daycare_admin", "DAYCAREADMIN"],
    ["daycare admin", "DAYCAREADMIN"]
  ])("normalizes user role %s to %s", (input, expected) => {
    expect(normalizeUserRole(input)).toBe(expected);
  });

  it.each([
    ["admin", "admin"],
    ["ADMIN", "admin"],
    ["Admin", "admin"],
    ["teacher", "teacher"],
    ["TEACHER", "teacher"],
    ["Teacher", "teacher"],
    ["parent", "parent"],
    ["PARENT", "parent"],
    ["Parent", "parent"],
    ["principal", "principal"],
    ["PRINCIPAL", "principal"],
    ["Principal", "principal"],
    ["daycareadmin", "daycare_admin"],
    ["DAYCAREADMIN", "daycare_admin"],
    ["DaycareAdmin", "daycare_admin"],
    ["daycareAdmin", "daycare_admin"],
    ["daycare_admin", "daycare_admin"],
    ["daycare admin", "daycare_admin"]
  ])("normalizes portal role %s to %s", (input, expected) => {
    expect(normalizePortalRole(input)).toBe(expected);
  });
});
