import { pgTable, uuid, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";
import { products } from "./products";

export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    productId: uuid("product_id").references(() => products.id).notNull(),
    quantity: integer("quantity").notNull().default(1),
    addedAt: timestamp("added_at").notNull().defaultNow(),
  },
  (t) => ({
    // prevent duplicates for same (user, product)
    userProductUniq: uniqueIndex("cart_items_user_product_uniq").on(t.userId, t.productId),
  })
);
