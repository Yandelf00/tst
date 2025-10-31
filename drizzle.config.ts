
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",                // migration folder (will be created)
  schema: "./src/db/schema/*",     // where your schema files live
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,  // uses .env
  },
  verbose: true,
  strict: true,
});
