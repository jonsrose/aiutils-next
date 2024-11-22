import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

// Create the postgres connection
export const connection = postgres(process.env.DATABASE_URL!);

// Create the database instance
export const db = drizzle(connection, { schema });

// Export the type
export type DrizzleDB = typeof db;