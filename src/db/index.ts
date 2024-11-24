import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

// Create the postgres connection
export const connection = postgres(process.env.POSTGRES_URL!, {
  ssl: 'require'
});

// Test connection
async function testConnection() {
  try {
    await connection`SELECT 1`;
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}
testConnection();

// Create the database instance
export const db = drizzle(connection, { schema });

// Export the type
export type DrizzleDB = typeof db;