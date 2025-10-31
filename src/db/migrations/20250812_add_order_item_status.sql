DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_item_shipment_status') THEN
    CREATE TYPE order_item_shipment_status AS ENUM ('pending','confirmed','shipped','delivered','cancelled');
  END IF;
END
$$;

ALTER TABLE "order_items"
  ADD COLUMN IF NOT EXISTS "shipment_status" order_item_shipment_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS "tracking_number" text,
  ADD COLUMN IF NOT EXISTS "shipped_at" timestamptz,
  ADD COLUMN IF NOT EXISTS "delivered_at" timestamptz;
