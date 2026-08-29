import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { attachDatabasePool } from "@vercel/functions";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Vercel Fluid: attach pool once, reuse across invocations
const pool = new Pool({
  connectionString,
  ssl: true,
});
attachDatabasePool(pool);

export const db = drizzle(pool, { schema });
