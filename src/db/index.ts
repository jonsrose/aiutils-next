import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import { readFileSync } from 'fs';

// Create the postgres connection
export const connection = postgres(process.env.POSTGRES_URL!, {
  ssl: {
    ca: readFileSync('./certs/prod-ca-2021.crt').toString()
  }
});

// Create the database instance
export const db = drizzle(connection, { schema });

// Export the type
export type DrizzleDB = typeof db;