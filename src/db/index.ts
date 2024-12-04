import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

// Create the postgres connection
export const connection = postgres(process.env.POSTGRES_URL!, {
  ssl: 'require',
  connect_timeout: 10,
  idle_timeout: 20,
  max_lifetime: 60 * 30
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