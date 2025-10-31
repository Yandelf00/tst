import { pgTable, uuid, varchar, text, timestamp, boolean, decimal } from "drizzle-orm/pg-core";
import { users } from "./users";
import { categories } from "./categories";

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),

  // Foreign keys
  sellerId: uuid("seller_id")
    .references(() => users.id)
    .notNull(),

  categoryId: uuid("category_id")
    .references(() => categories.id)
    .notNull(),
});
