
import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  role: text("role").notNull(), // buyer or seller
  profile_image_url: text("profile_image_url"),
  is_blocked: boolean("is_blocked").default(false),
  is_admin: boolean("is_admin").default(false),
  created_at: timestamp("created_at").defaultNow(),
  deleted_at: timestamp("deleted_at"),
});

// Buyers table
export const buyers = pgTable("buyers", {
  userId: uuid("user_id").primaryKey().references(() => users.id),
});

// Sellers table
export const sellers = pgTable("sellers", {
  userId: uuid("user_id").primaryKey().references(() => users.id),
  companyName: text("company_name").notNull(),
  address: text("address").notNull(),      // keep your existing column as-is
  addressUrl: text("address_url"),         // NEW: Google Maps URL (nullable for safe migration)
  ice: text("ice"),                         // NEW: ICE string (nullable for safe migration)
  isApproved: boolean("is_approved").default(false).notNull(),
});
