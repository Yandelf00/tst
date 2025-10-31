


// src/db/schema/orders.ts
import {
  pgTable,
  uuid,
  integer,
  text,
  timestamp,
  pgEnum,
  bigserial,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { products } from "./products";

/**
 * We store money as integer cents here.
 * Render as dollars in the UI by dividing by 100.
 */

export const orderItemShipmentStatusEnum = pgEnum("order_item_shipment_status", [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
]);

// One row per order
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Human-friendly, auto-incrementing display number
  orderNumber: bigserial("order_number", { mode: "number" }).unique(),

  buyerId: uuid("buyer_id").references(() => users.id).notNull(),
  totalAmount: integer("total_amount").notNull(), // cents snapshot at create time
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// One row per product in the order
export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  sellerId: uuid("seller_id").references(() => users.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
  price: integer("price").notNull(), // cents snapshot
  productName: text("product_name").notNull(),
  productImage: text("product_image"),
  shipmentStatus: orderItemShipmentStatusEnum("shipment_status")
    .notNull()
    .default("pending"),
  trackingNumber: text("tracking_number"),
  shippedAt: timestamp("shipped_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
});
