export const normalizeUserRole = (role: unknown): unknown => {
  if (typeof role !== "string") {
    return role;
  }

  const normalized = role.trim().toUpperCase().replace(/[\s_-]+/g, "");
  if (normalized === "DAYCAREADMIN") {
    return "DAYCAREADMIN";
  }

  return normalized;
};

export const normalizePortalRole = (role: unknown): unknown => {
  if (typeof role !== "string") {
    return role;
  }

  const normalized = role.trim().toLowerCase().replace(/[\s_-]+/g, "");
  if (normalized === "administrator") {
    return "admin";
  }
  if (normalized === "daycareadmin") {
    return "daycare_admin";
  }

  return normalized;
};
