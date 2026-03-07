// lib/seeds/users.ts
// Seed admin user. Used by /api/dev/seed to create the admin account in Firebase Auth.

export const SEED_ADMIN_USER = {
  uid: "admin_licorice",
  email: "admin@licoriceherbal.in",
  password: "Admin@Licorice123",
  displayName: "Licorice Admin",
  role: "admin" as const,
};
