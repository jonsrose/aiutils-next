import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from '@vercel/postgres';
import * as schema from './schema';

// Use different configurations for development and production
const db = process.env.NODE_ENV === 'development' 
  ? drizzle(
      postgres(process.env.POSTGRES_URL!, {
        ssl: false,
        max: 1
      }), 
      { schema }
    )
  : drizzle(sql, { schema });

export { db };
