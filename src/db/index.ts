import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from './schema';

// Initialize drizzle with schema
const db = drizzle(sql, { schema });

export { db };
